const Document =
    require("../models/Document");

const Folder =
    require("../models/Folder");

const {

    generateFileKey,

    uploadToB2,

    deleteFromB2,

    getSignedViewUrl

} = require("../utils/b2Helper");

const {

    canUserUpload,

    addStorageUsage,

    removeStorageUsage,

    getUserStorageInfo

} = require("../utils/storageManager");

const {

    compressFile,

    formatBytes

} = require("../utils/fileCompressor");

// =========================
// HELPER — DETERMINE FILE TYPE
// =========================

const getFileType = (mimeType) => {

    if (!mimeType) return "other";

    if (mimeType === "application/pdf")
        return "pdf";

    if (mimeType.startsWith("image/"))
        return "image";

    if (
        mimeType.includes("word") ||
        mimeType === "application/msword"
    )
        return "doc";

    if (
        mimeType.includes("powerpoint") ||
        mimeType.includes("presentation")
    )
        return "ppt";

    if (mimeType.startsWith("text/"))
        return "text";

    return "other";
};

// =========================
// CHECK STORAGE BEFORE UPLOAD
// =========================

exports.checkStorage = async (
    req,
    res
) => {

    try {

        const {
            fileSize
        } = req.body;

        if (
            !fileSize ||
            isNaN(fileSize)
        ) {

            return res.status(400).json({
                message: "fileSize required"
            });
        }

        const check =
            await canUserUpload(
                req.user._id,
                parseInt(fileSize)
            );

        res.json({

            allowed:
                check.allowed,

            reason:
                check.reason || null,

            storageInfo:
                check.currentUsage
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// UPLOAD SINGLE DOCUMENT
// (With compression)
// =========================

exports.uploadDocument = async (
    req,
    res
) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const {
            title,
            folderId
        } = req.body;

        // =========================
        // COMPRESS FILE
        // =========================

        console.log(
            `📦 Compressing ${req.file.originalname} (${formatBytes(req.file.size)})...`
        );

        const compressionResult =
            await compressFile(

                req.file.buffer,

                req.file.mimetype
            );

        if (compressionResult.wasCompressed) {

            console.log(
                `✅ Compressed: ${formatBytes(compressionResult.originalSize)} → ${formatBytes(compressionResult.compressedSize)} (saved ${compressionResult.savings}%)`
            );
        }

        const finalBuffer = compressionResult.buffer;

        const finalSize = compressionResult.compressedSize;

        const finalMimeType =
            compressionResult.outputMime || req.file.mimetype;

        // =========================
        // QUOTA CHECK (use COMPRESSED size)
        // =========================

        const quotaCheck =
            await canUserUpload(

                req.user._id,

                finalSize
            );

        if (!quotaCheck.allowed) {

            return res.status(413).json({

                message:
                    quotaCheck.reason,

                storageInfo:
                    quotaCheck.currentUsage
            });
        }

        // =========================
        // VALIDATE FOLDER (if provided)
        // =========================

        let validFolderId = null;

        if (folderId && folderId !== "null" && folderId !== "root") {

            const folder =
                await Folder.findOne({

                    _id: folderId,

                    userId: req.user._id
                });

            if (!folder) {

                return res.status(404).json({
                    message: "Folder not found"
                });
            }

            validFolderId = folder._id;
        }

        // =========================
        // UPLOAD TO B2
        // =========================

        const b2Key =
            generateFileKey(

                req.user._id,

                req.file.originalname,

                "vault"
            );

        await uploadToB2(

            finalBuffer,

            b2Key,

            finalMimeType
        );

        // =========================
        // CREATE DB RECORD
        // =========================

        const document =
            await Document.create({

                title:
                    title ||
                    req.file.originalname.replace(/\.[^/.]+$/, ""),

                description: "",

                b2Key,

                b2Bucket:
                    process.env.B2_BUCKET_NAME,

                originalFileName:
                    req.file.originalname,

                fileSize:
                    finalSize,

                mimeType:
                    finalMimeType,

                fileType:
                    getFileType(finalMimeType),

                originalFileSize:
                    compressionResult.originalSize,

                compressionSavings:
                    compressionResult.savings,

                uploadedBy:
                    req.user._id,

                folderId:
                    validFolderId,

                visibility: "private",

                subject: "",

                topic: "",

                tags: [],

                source: ""
            });

        await addStorageUsage(

            req.user._id,

            finalSize
        );

        res.status(201).json({

            message:
                "Document uploaded successfully",

            document,

            compression: {

                wasCompressed:
                    compressionResult.wasCompressed,

                originalSize:
                    compressionResult.originalSize,

                compressedSize:
                    compressionResult.compressedSize,

                savings:
                    compressionResult.savings,

                savingsFormatted:
                    formatBytes(
                        compressionResult.originalSize -
                        compressionResult.compressedSize
                    )
            }
        });

    } catch (err) {

        console.error(
            "Upload Document Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// BULK UPLOAD (with compression)
// =========================

exports.bulkUpload = async (
    req,
    res
) => {

    try {

        if (
            !req.files ||
            req.files.length === 0
        ) {

            return res.status(400).json({
                message: "No files uploaded"
            });
        }

        const {
            folderId
        } = req.body;

        const results = {
            uploaded: [],
            failed: []
        };

        // =========================
        // VALIDATE FOLDER
        // =========================

        let validFolderId = null;

        if (folderId && folderId !== "null" && folderId !== "root") {

            const folder =
                await Folder.findOne({

                    _id: folderId,

                    userId: req.user._id
                });

            if (folder) {

                validFolderId = folder._id;
            }
        }

        // =========================
        // UPLOAD EACH FILE (with compression)
        // =========================

        for (const file of req.files) {

            try {

                // COMPRESS

                console.log(
                    `📦 Compressing ${file.originalname}...`
                );

                const compressionResult =
                    await compressFile(

                        file.buffer,

                        file.mimetype
                    );

                if (compressionResult.wasCompressed) {

                    console.log(
                        `✅ ${file.originalname}: ${formatBytes(compressionResult.originalSize)} → ${formatBytes(compressionResult.compressedSize)} (-${compressionResult.savings}%)`
                    );
                }

                const finalBuffer = compressionResult.buffer;

                const finalSize = compressionResult.compressedSize;

                const finalMimeType =
                    compressionResult.outputMime || file.mimetype;

                // CHECK QUOTA per file

                const check =
                    await canUserUpload(
                        req.user._id,
                        finalSize
                    );

                if (!check.allowed) {

                    results.failed.push({

                        name: file.originalname,

                        error: "Storage quota exceeded"
                    });

                    continue;
                }

                // UPLOAD TO B2

                const b2Key =
                    generateFileKey(

                        req.user._id,

                        file.originalname,

                        "vault"
                    );

                await uploadToB2(

                    finalBuffer,

                    b2Key,

                    finalMimeType
                );

                const doc =
                    await Document.create({

                        title:
                            file.originalname.replace(/\.[^/.]+$/, ""),

                        description: "",

                        b2Key,

                        b2Bucket:
                            process.env.B2_BUCKET_NAME,

                        originalFileName:
                            file.originalname,

                        fileSize:
                            finalSize,

                        mimeType:
                            finalMimeType,

                        fileType:
                            getFileType(finalMimeType),

                        originalFileSize:
                            compressionResult.originalSize,

                        compressionSavings:
                            compressionResult.savings,

                        uploadedBy:
                            req.user._id,

                        folderId:
                            validFolderId,

                        visibility: "private",

                        subject: "",

                        topic: "",

                        tags: [],

                        source: ""
                    });

                await addStorageUsage(

                    req.user._id,

                    finalSize
                );

                results.uploaded.push({

                    name:
                        file.originalname,

                    id:
                        doc._id,

                    size:
                        finalSize,

                    originalSize:
                        compressionResult.originalSize,

                    savings:
                        compressionResult.savings
                });

            } catch (err) {

                console.error(
                    `Failed to upload ${file.originalname}:`,
                    err
                );

                results.failed.push({

                    name:
                        file.originalname,

                    error:
                        err.message
                });
            }
        }

        res.status(201).json({

            message:
                `Bulk upload complete: ${results.uploaded.length} succeeded, ${results.failed.length} failed`,

            ...results
        });

    } catch (err) {

        console.error(
            "Bulk Upload Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// PUBLISH TO COMMUNITY
// =========================

exports.publishToCommunity = async (
    req,
    res
) => {

    try {

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (
            doc.uploadedBy.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({
                message: "Not authorized"
            });
        }

        const {
            subject,
            topic,
            description,
            source,
            tags
        } = req.body;

        if (!subject || !subject.trim()) {

            return res.status(400).json({
                message:
                    "Subject is required to share publicly"
            });
        }

        let parsedTags = [];

        if (tags) {

            if (typeof tags === "string") {

                try {

                    parsedTags = JSON.parse(tags);

                } catch {

                    parsedTags =
                        tags.split(",")
                            .map(t => t.trim())
                            .filter(Boolean);
                }

            } else if (Array.isArray(tags)) {

                parsedTags = tags;
            }
        }

        doc.visibility = "public";

        doc.subject = subject.trim();

        doc.topic = topic ? topic.trim() : "";

        doc.description = description ? description.trim() : doc.description;

        doc.source = source ? source.trim() : doc.source;

        if (parsedTags.length > 0) {

            doc.tags = parsedTags;
        }

        await doc.save();

        res.json({

            message: "Document published to community",

            document: doc
        });

    } catch (err) {

        console.error(
            "Publish Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// UNPUBLISH
// =========================

exports.unpublish = async (
    req,
    res
) => {

    try {

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (
            doc.uploadedBy.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({
                message: "Not authorized"
            });
        }

        doc.visibility = "private";

        doc.isFeatured = false;

        await doc.save();

        res.json({

            message: "Document is now private",

            document: doc
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET MY VAULT DOCUMENTS
// =========================

exports.getMyDocuments = async (
    req,
    res
) => {

    try {

        const {
            folderId,
            search,
            fileType,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const query = {

            uploadedBy:
                req.user._id,

            isDeleted:
                false
        };

        if (folderId === "root" || !folderId) {

            query.folderId = null;

        } else {

            query.folderId = folderId;
        }

        if (fileType) {

            query.fileType = fileType;
        }

        if (search) {

            query.$text = {
                $search: search
            };
        }

        const sortOption = {};

        sortOption[sortBy] =
            order === "asc" ? 1 : -1;

        const docs =
            await Document

                .find(query)

                .sort(sortOption);

        res.json(docs);

    } catch (err) {

        console.error(
            "Get Documents Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET DOCUMENT VIEW URL
// =========================

exports.getViewUrl = async (
    req,
    res
) => {

    try {

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc || doc.isDeleted) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        const isOwner =
            doc.uploadedBy.toString() ===
            req.user._id.toString();

        const isPublic =
            doc.visibility === "public";

        const isAdmin = req.user.isAdmin;

        if (!isOwner && !isPublic && !isAdmin) {

            return res.status(403).json({
                message:
                    "You don't have access to this document"
            });
        }

        const signedUrl =
            await getSignedViewUrl(
                doc.b2Key,
                300
            );

        // Update view count (only for non-owners)

        if (!isOwner) {

            doc.viewCount += 1;

            const viewerExists =
                doc.uniqueViewers.some(v =>
                    v.toString() ===
                    req.user._id.toString()
                );

            if (!viewerExists) {

                doc.uniqueViewers.push(
                    req.user._id
                );
            }
        }

        // Track recent view (for ALL users)

        const existingRecentIdx =
            doc.recentViewers.findIndex(rv =>
                rv.userId.toString() ===
                req.user._id.toString()
            );

        if (existingRecentIdx !== -1) {

            doc.recentViewers[existingRecentIdx].viewedAt =
                new Date();

        } else {

            doc.recentViewers.push({

                userId: req.user._id,

                viewedAt: new Date()
            });
        }

        // Keep only last 50 viewers

        if (doc.recentViewers.length > 50) {

            doc.recentViewers =
                doc.recentViewers

                    .sort((a, b) =>
                        new Date(b.viewedAt) -
                        new Date(a.viewedAt)
                    )

                    .slice(0, 50);
        }

        await doc.save();

        res.json({

            viewUrl:
                signedUrl,

            expiresIn:
                300,

            document: {

                _id: doc._id,

                title: doc.title,

                fileType: doc.fileType,

                mimeType: doc.mimeType,

                pageCount: doc.pageCount
            },

            watermark: {

                userId:
                    req.user._id.toString(),

                userEmail:
                    req.user.email,

                timestamp:
                    new Date().toISOString()
            }
        });

    } catch (err) {

        console.error(
            "Get View URL Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// UPDATE DOCUMENT
// =========================

exports.updateDocument = async (
    req,
    res
) => {

    try {

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc || doc.isDeleted) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (
            doc.uploadedBy.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({
                message: "Not authorized"
            });
        }

        const {
            title,
            description,
            subject,
            topic,
            tags,
            source
        } = req.body;

        if (title !== undefined)
            doc.title = title;

        if (description !== undefined)
            doc.description = description;

        if (subject !== undefined)
            doc.subject = subject;

        if (topic !== undefined)
            doc.topic = topic;

        if (source !== undefined)
            doc.source = source;

        if (tags !== undefined) {

            doc.tags =
                Array.isArray(tags)
                    ? tags
                    : tags.split(",").map(t => t.trim());
        }

        await doc.save();

        res.json(doc);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// MOVE DOCUMENT
// =========================

exports.moveDocument = async (
    req,
    res
) => {

    try {

        const {
            newFolderId
        } = req.body;

        const doc =
            await Document.findById(
                req.params.id
            );

        if (
            !doc ||
            doc.uploadedBy.toString() !==
            req.user._id.toString()
        ) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (newFolderId) {

            const folder =
                await Folder.findOne({

                    _id: newFolderId,

                    userId: req.user._id
                });

            if (!folder) {

                return res.status(404).json({
                    message: "Folder not found"
                });
            }

            doc.folderId = folder._id;

        } else {

            doc.folderId = null;
        }

        await doc.save();

        res.json({

            message: "Document moved",

            document: doc
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// DELETE DOCUMENT
// =========================

exports.deleteDocument = async (
    req,
    res
) => {

    try {

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        const isOwner =
            doc.uploadedBy.toString() ===
            req.user._id.toString();

        const isAdmin = req.user.isAdmin;

        if (!isOwner && !isAdmin) {

            return res.status(403).json({
                message: "Not authorized"
            });
        }

        try {

            await deleteFromB2(doc.b2Key);

        } catch (e) {

            console.error(
                "B2 delete failed:",
                e.message
            );
        }

        if (isOwner) {

            await removeStorageUsage(

                req.user._id,

                doc.fileSize
            );
        }

        await doc.deleteOne();

        res.json({

            message: "Document deleted",

            freedBytes:
                doc.fileSize
        });

    } catch (err) {

        console.error(
            "Delete Document Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// BROWSE COMMUNITY
// =========================

exports.browseCommunity = async (
    req,
    res
) => {

    try {

        const {
            search,
            subject,
            topic,
            fileType,
            source,
            sortBy = "createdAt",
            order = "desc",
            page = 1,
            limit = 24
        } = req.query;

        const query = {

            visibility: "public",

            isDeleted: false
        };

        if (subject) {

            if (topic === "__no_topic__") {

                query.subject = subject;

                query.$or = [
                    { topic: "" },
                    { topic: null }
                ];

            } else {

                query.subject = subject;
            }
        }

        if (topic && topic !== "__no_topic__") {

            query.topic = topic;
        }

        if (fileType) {

            query.fileType = fileType;
        }

        if (source) {

            query.source = {
                $regex: source,
                $options: "i"
            };
        }

        if (search) {

            query.$text = {
                $search: search
            };
        }

        const sortOption = {};

        sortOption[sortBy] =
            order === "asc" ? 1 : -1;

        const skip =
            (parseInt(page) - 1) *
            parseInt(limit);

        const [docs, total] = await Promise.all([

            Document

                .find(query)

                .populate(
                    "uploadedBy",
                    "name"
                )

                .sort(sortOption)

                .skip(skip)

                .limit(parseInt(limit)),

            Document.countDocuments(query)
        ]);

        res.json({

            documents:
                docs,

            total,

            page:
                parseInt(page),

            totalPages:
                Math.ceil(total / parseInt(limit))
        });

    } catch (err) {

        console.error(
            "Browse Community Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET FEATURED
// =========================

exports.getFeatured = async (
    req,
    res
) => {

    try {

        const {
            limit = 6
        } = req.query;

        const featured =
            await Document

                .find({

                    visibility: "public",

                    isFeatured: true,

                    isDeleted: false
                })

                .populate(
                    "uploadedBy",
                    "name"
                )

                .sort({
                    featuredAt: -1
                })

                .limit(parseInt(limit));

        res.json(featured);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET COMMUNITY FILTERS
// =========================

exports.getCommunityFilters = async (
    req,
    res
) => {

    try {

        const [
            subjects,
            topics,
            sources,
            fileTypes
        ] = await Promise.all([

            Document.distinct("subject", {
                visibility: "public",
                isDeleted: false
            }),

            Document.distinct("topic", {
                visibility: "public",
                isDeleted: false
            }),

            Document.distinct("source", {
                visibility: "public",
                isDeleted: false
            }),

            Document.distinct("fileType", {
                visibility: "public",
                isDeleted: false
            })
        ]);

        res.json({

            subjects:
                subjects.filter(Boolean).sort(),

            topics:
                topics.filter(Boolean).sort(),

            sources:
                sources.filter(Boolean).sort(),

            fileTypes:
                fileTypes.filter(Boolean).sort()
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET COMMUNITY GROUPED
// =========================

exports.getCommunityGrouped = async (
    req,
    res
) => {

    try {

        const grouped =
            await Document.aggregate([

                {
                    $match: {

                        visibility: "public",

                        isDeleted: false,

                        subject: {
                            $ne: ""
                        }
                    }
                },

                {
                    $group: {

                        _id: {

                            subject: "$subject",

                            topic: "$topic"
                        },

                        count: {
                            $sum: 1
                        },

                        totalSize: {
                            $sum: "$fileSize"
                        },

                        latestUpload: {
                            $max: "$createdAt"
                        }
                    }
                },

                {
                    $group: {

                        _id: "$_id.subject",

                        topics: {

                            $push: {

                                name: "$_id.topic",

                                count: "$count",

                                totalSize: "$totalSize",

                                latestUpload: "$latestUpload"
                            }
                        },

                        totalCount: {
                            $sum: "$count"
                        },

                        totalSize: {
                            $sum: "$totalSize"
                        }
                    }
                },

                {
                    $sort: {
                        totalCount: -1
                    }
                }
            ]);

        const result =
            grouped.map(g => ({

                subject:
                    g._id,

                totalFiles:
                    g.totalCount,

                totalSize:
                    g.totalSize,

                topics:
                    g.topics

                        .sort((a, b) =>
                            b.count - a.count
                        )
            }));

        res.json(result);

    } catch (err) {

        console.error(
            "Grouped Community Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// TOGGLE BOOKMARK
// =========================

exports.toggleBookmark = async (
    req,
    res
) => {

    try {

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (doc.visibility !== "public") {

            return res.status(400).json({
                message:
                    "Only public documents can be bookmarked"
            });
        }

        const userId = req.user._id.toString();

        const isBookmarked =
            doc.bookmarkedBy.some(b =>
                b.toString() === userId
            );

        if (isBookmarked) {

            doc.bookmarkedBy =
                doc.bookmarkedBy.filter(b =>
                    b.toString() !== userId
                );

        } else {

            doc.bookmarkedBy.push(req.user._id);
        }

        await doc.save();

        res.json({

            message:
                isBookmarked
                    ? "Bookmark removed"
                    : "Bookmarked",

            isBookmarked:
                !isBookmarked,

            totalBookmarks:
                doc.bookmarkedBy.length
        });

    } catch (err) {

        console.error(
            "Toggle Bookmark Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET MY BOOKMARKED DOCUMENTS
// =========================

exports.getMyBookmarks = async (
    req,
    res
) => {

    try {

        const docs =
            await Document

                .find({

                    bookmarkedBy:
                        req.user._id,

                    visibility:
                        "public",

                    isDeleted:
                        false
                })

                .populate(
                    "uploadedBy",
                    "name"
                )

                .sort({
                    updatedAt: -1
                });

        res.json(docs);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET RECENTLY VIEWED
// =========================

exports.getRecentlyViewed = async (
    req,
    res
) => {

    try {

        const limit = parseInt(req.query.limit) || 6;

        const docs =
            await Document.aggregate([

                {
                    $match: {
                        "recentViewers.userId":
                            req.user._id,

                        isDeleted: false
                    }
                },

                {
                    $unwind: "$recentViewers"
                },

                {
                    $match: {

                        "recentViewers.userId":
                            req.user._id
                    }
                },

                {
                    $sort: {
                        "recentViewers.viewedAt": -1
                    }
                },

                {
                    $limit: limit
                },

                {
                    $lookup: {

                        from: "users",

                        localField: "uploadedBy",

                        foreignField: "_id",

                        as: "uploaderInfo"
                    }
                },

                {
                    $project: {

                        title: 1,

                        fileType: 1,

                        fileSize: 1,

                        subject: 1,

                        topic: 1,

                        visibility: 1,

                        viewedAt:
                            "$recentViewers.viewedAt",

                        uploaderName: {

                            $arrayElemAt: [
                                "$uploaderInfo.name",
                                0
                            ]
                        },

                        isMine: {

                            $eq: [
                                "$uploadedBy",
                                req.user._id
                            ]
                        }
                    }
                }
            ]);

        res.json(docs);

    } catch (err) {

        console.error(
            "Recently Viewed Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — TOGGLE FEATURED
// =========================

exports.adminToggleFeatured = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        if (doc.visibility !== "public") {

            return res.status(400).json({
                message:
                    "Only public documents can be featured"
            });
        }

        doc.isFeatured = !doc.isFeatured;

        doc.featuredAt =
            doc.isFeatured
                ? new Date()
                : null;

        doc.featuredBy =
            doc.isFeatured
                ? req.user._id
                : null;

        await doc.save();

        res.json({

            message:
                doc.isFeatured
                    ? "Document featured ⭐"
                    : "Removed from featured",

            document: doc
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — FORCE DELETE
// =========================

exports.adminDelete = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        try {

            await deleteFromB2(doc.b2Key);

        } catch (e) {

            console.error(
                "B2 delete failed:",
                e.message
            );
        }

        await removeStorageUsage(

            doc.uploadedBy,

            doc.fileSize
        );

        await doc.deleteOne();

        res.json({

            message:
                "Document force-deleted by admin",

            freedBytes:
                doc.fileSize
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — FORCE PRIVATE
// =========================

exports.adminForcePrivate = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        const doc =
            await Document.findById(
                req.params.id
            );

        if (!doc) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        doc.visibility = "private";

        doc.isFeatured = false;

        await doc.save();

        res.json({

            message:
                "Document made private by admin",

            document: doc
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};
const Folder =
    require("../models/Folder");

const Document =
    require("../models/Document");

// =========================
// CREATE FOLDER
// =========================

exports.createFolder = async (
    req,
    res
) => {

    try {

        const {
            name,
            parentId,
            color,
            icon,
            description
        } = req.body;

        if (!name || !name.trim()) {

            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        let path = "";

        let depth = 0;

        // If parent provided, build path

        if (parentId) {

            const parent =
                await Folder.findOne({

                    _id: parentId,

                    userId:
                        req.user._id
                });

            if (!parent) {

                return res.status(404).json({
                    message:
                        "Parent folder not found"
                });
            }

            path =
                parent.path
                    ? `${parent.path}/${parent._id}`
                    : `/${parent._id}`;

            depth = parent.depth + 1;

            if (depth > 10) {

                return res.status(400).json({
                    message:
                        "Maximum folder nesting depth (10) reached"
                });
            }
        }

        // Check duplicate name in same parent

        const existing =
            await Folder.findOne({

                userId:
                    req.user._id,

                parentId:
                    parentId || null,

                name:
                    name.trim()
            });

        if (existing) {

            return res.status(409).json({
                message:
                    "A folder with this name already exists here"
            });
        }

        const folder =
            await Folder.create({

                name:
                    name.trim(),

                userId:
                    req.user._id,

                parentId:
                    parentId || null,

                path,

                depth,

                color:
                    color || "blue",

                icon:
                    icon || "📁",

                description:
                    description || ""
            });

        res.status(201).json(folder);

    } catch (err) {

        console.error(
            "Create Folder Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET MY FOLDERS
// (Optional: filter by parentId)
// =========================

exports.getMyFolders = async (
    req,
    res
) => {

    try {

        const { parentId } = req.query;

        const query = {
            userId: req.user._id
        };

        if (parentId === "root" || !parentId) {

            query.parentId = null;

        } else {

            query.parentId = parentId;
        }

        const folders =
            await Folder

                .find(query)

                .sort({ name: 1 });

        // Get document counts per folder

        const folderIds =
            folders.map(f => f._id);

        const docCounts =
            await Document.aggregate([

                {
                    $match: {

                        uploadedBy:
                            req.user._id,

                        folderId: {
                            $in: folderIds
                        },

                        scope: "vault"
                    }
                },

                {
                    $group: {

                        _id: "$folderId",

                        count: {
                            $sum: 1
                        },

                        totalSize: {
                            $sum: "$fileSize"
                        }
                    }
                }
            ]);

        const countMap = {};

        docCounts.forEach(d => {

            countMap[d._id.toString()] = {

                count: d.count,

                totalSize: d.totalSize
            };
        });

        const enriched =
            folders.map(f => ({

                ...f.toObject(),

                fileCount:
                    countMap[f._id.toString()]?.count || 0,

                totalSize:
                    countMap[f._id.toString()]?.totalSize || 0
            }));

        res.json(enriched);

    } catch (err) {

        console.error(
            "Get Folders Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET FOLDER BY ID (with breadcrumbs)
// =========================

exports.getFolderById = async (
    req,
    res
) => {

    try {

        const folder =
            await Folder.findOne({

                _id:
                    req.params.id,

                userId:
                    req.user._id
            });

        if (!folder) {

            return res.status(404).json({
                message: "Folder not found"
            });
        }

        // Build breadcrumb trail

        let breadcrumbs = [];

        if (folder.path) {

            const ancestorIds =
                folder.path

                    .split("/")

                    .filter(Boolean);

            const ancestors =
                await Folder

                    .find({
                        _id: { $in: ancestorIds },
                        userId: req.user._id
                    })

                    .select("_id name");

            // Preserve path order

            breadcrumbs =
                ancestorIds.map(id => {

                    const found =
                        ancestors.find(a =>
                            a._id.toString() === id
                        );

                    return found
                        ? { _id: found._id, name: found.name }
                        : null;

                }).filter(Boolean);
        }

        res.json({

            folder,

            breadcrumbs
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// RENAME FOLDER
// =========================

exports.renameFolder = async (
    req,
    res
) => {

    try {

        const { name } = req.body;

        if (!name || !name.trim()) {

            return res.status(400).json({
                message: "Name required"
            });
        }

        const folder =
            await Folder.findOne({

                _id: req.params.id,

                userId: req.user._id
            });

        if (!folder) {

            return res.status(404).json({
                message: "Folder not found"
            });
        }

        // Check duplicate

        const duplicate =
            await Folder.findOne({

                userId:
                    req.user._id,

                parentId:
                    folder.parentId,

                name:
                    name.trim(),

                _id: {
                    $ne: folder._id
                }
            });

        if (duplicate) {

            return res.status(409).json({
                message:
                    "Another folder with this name exists here"
            });
        }

        folder.name = name.trim();

        await folder.save();

        res.json(folder);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// MOVE FOLDER
// =========================

exports.moveFolder = async (
    req,
    res
) => {

    try {

        const { newParentId } = req.body;

        const folder =
            await Folder.findOne({

                _id:
                    req.params.id,

                userId:
                    req.user._id
            });

        if (!folder) {

            return res.status(404).json({
                message: "Folder not found"
            });
        }

        // Validate new parent

        let newPath = "";

        let newDepth = 0;

        if (newParentId) {

            // Cannot move folder into itself or its descendants

            if (newParentId === folder._id.toString()) {

                return res.status(400).json({
                    message:
                        "Cannot move folder into itself"
                });
            }

            const newParent =
                await Folder.findOne({

                    _id: newParentId,

                    userId: req.user._id
                });

            if (!newParent) {

                return res.status(404).json({
                    message:
                        "Target folder not found"
                });
            }

            // Check circular: is folder in newParent's ancestors?

            if (
                newParent.path &&

                newParent.path.includes(folder._id.toString())
            ) {

                return res.status(400).json({
                    message:
                        "Cannot move folder into its own descendant"
                });
            }

            newPath =
                newParent.path
                    ? `${newParent.path}/${newParent._id}`
                    : `/${newParent._id}`;

            newDepth = newParent.depth + 1;
        }

        const oldPath =
            folder.path
                ? `${folder.path}/${folder._id}`
                : `/${folder._id}`;

        folder.parentId =
            newParentId || null;

        folder.path = newPath;

        folder.depth = newDepth;

        await folder.save();

        // Update all descendants' paths

        const newFullPath =
            newPath
                ? `${newPath}/${folder._id}`
                : `/${folder._id}`;

        const descendants =
            await Folder.find({

                userId:
                    req.user._id,

                path:
                    {
                        $regex:
                            `^${oldPath}(/|$)`
                    }
            });

        for (const desc of descendants) {

            desc.path =
                desc.path.replace(
                    oldPath,
                    newFullPath
                );

            const segments =
                desc.path.split("/").filter(Boolean);

            desc.depth = segments.length;

            await desc.save();
        }

        res.json({

            message: "Folder moved",

            folder
        });

    } catch (err) {

        console.error(
            "Move Folder Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// DELETE FOLDER
// (Cascades — deletes all children + files)
// =========================

exports.deleteFolder = async (
    req,
    res
) => {

    try {

        const folder =
            await Folder.findOne({

                _id: req.params.id,

                userId: req.user._id
            });

        if (!folder) {

            return res.status(404).json({
                message: "Folder not found"
            });
        }

        const folderPath =
            folder.path
                ? `${folder.path}/${folder._id}`
                : `/${folder._id}`;

        // Find all descendant folders

        const descendants =
            await Folder.find({

                userId: req.user._id,

                path: {
                    $regex:
                        `^${folderPath}(/|$)`
                }
            });

        const allFolderIds =
            [
                folder._id,
                ...descendants.map(d => d._id)
            ];

        // Cascade: get all docs in these folders

        const docs =
            await Document.find({

                uploadedBy:
                    req.user._id,

                folderId: {
                    $in: allFolderIds
                },

                scope: "vault"
            });

        // Delete files from B2

        const {
            deleteFromB2
        } = require("../utils/b2Helper");

        const {
            removeStorageUsage
        } = require("../utils/storageManager");

        let totalFreedBytes = 0;

        for (const doc of docs) {

            try {

                await deleteFromB2(doc.b2Key);

                totalFreedBytes += doc.fileSize;

            } catch (e) {

                console.error(
                    `Failed to delete ${doc.b2Key}:`,
                    e.message
                );
            }
        }

        // Update storage usage

        if (totalFreedBytes > 0) {

            await removeStorageUsage(
                req.user._id,
                totalFreedBytes
            );
        }

        // Delete docs from DB

        await Document.deleteMany({

            _id: {
                $in: docs.map(d => d._id)
            }
        });

        // Delete folders from DB

        await Folder.deleteMany({

            _id: {
                $in: allFolderIds
            }
        });

        res.json({

            message:
                "Folder deleted",

            deletedFolders:
                allFolderIds.length,

            deletedFiles:
                docs.length,

            freedBytes:
                totalFreedBytes
        });

    } catch (err) {

        console.error(
            "Delete Folder Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET ALL FOLDERS (FLAT — for move/picker)
// =========================

exports.getAllFoldersFlat = async (
    req,
    res
) => {

    try {

        const folders =
            await Folder

                .find({
                    userId: req.user._id
                })

                .sort({ path: 1, name: 1 })

                .select("_id name parentId path depth icon color");

        res.json(folders);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};
const Document =
    require("../models/Document");

const Question =
    require("../models/Question");

const Folder =
    require("../models/Folder");

const MainsQuestion =
    require("../models/MainsQuestion");

// =========================
// UNIVERSAL SEARCH
// Searches across:
// - Documents (vault + community)
// - Prelims Questions
// - Mains Questions
// - Folders
// =========================

exports.universalSearch = async (
    req,
    res
) => {

    try {

        const {
            q,
            limit = 5
        } = req.query;

        if (!q || q.trim().length < 2) {

            return res.json({
                results: {
                    documents: [],
                    prelimsQuestions: [],
                    mainsQuestions: [],
                    folders: []
                },
                total: 0
            });
        }

        const searchTerm = q.trim();

        const userId = req.user._id;

        const limitNum = parseInt(limit);

        // =========================
        // PARALLEL SEARCH
        // =========================

        const [
            myDocuments,
            communityDocs,
            myFolders,
            prelimsQs,
            mainsQs
        ] = await Promise.all([

            // My vault documents

            Document

                .find({

                    uploadedBy: userId,

                    isDeleted: false,

                    $or: [
                        {
                            title: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        }
                    ]
                })

                .select("title fileType subject topic visibility folderId fileSize")

                .limit(limitNum),

            // Public community docs

            Document

                .find({

                    visibility: "public",

                    isDeleted: false,

                    uploadedBy: { $ne: userId },

                    $or: [
                        {
                            title: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            subject: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            topic: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        }
                    ]
                })

                .populate("uploadedBy", "name")

                .select("title fileType subject topic uploadedBy viewCount")

                .limit(limitNum),

            // My folders

            Folder

                .find({

                    userId,

                    name: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                })

                .select("name icon path depth")

                .limit(limitNum),

            // Prelims questions

            Question

                .find({

                    reviewStatus: "Approved",

                    $or: [
                        {
                            questionText: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            subjectName: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            topicName: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        }
                    ]
                })

                .select("questionText year paper subjectName topicName")

                .limit(limitNum),

            // Mains questions

            MainsQuestion

                .find({

                    reviewStatus: "Approved",

                    $or: [
                        {
                            questionText: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            subjectName: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        },
                        {
                            topicName: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        }
                    ]
                })

                .select("questionText year paper marks subjectName topicName")

                .limit(limitNum)
        ]);

        // Combine vault + community docs

        const allDocs = [

            ...myDocuments.map(d => ({

                ...d.toObject(),

                isMine: true
            })),

            ...communityDocs.map(d => ({

                ...d.toObject(),

                isMine: false
            }))
        ];

        const total =
            allDocs.length +
            myFolders.length +
            prelimsQs.length +
            mainsQs.length;

        res.json({

            results: {

                documents: allDocs,

                folders: myFolders,

                prelimsQuestions: prelimsQs,

                mainsQuestions: mainsQs
            },

            total,

            query: searchTerm
        });

    } catch (err) {

        console.error(
            "Universal Search Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};
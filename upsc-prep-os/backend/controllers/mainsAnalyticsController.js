const MainsQuestion =
    require("../models/MainsQuestion");

const MainsAttempt =
    require("../models/MainsAttempt");

// =========================
// DASHBOARD STATS
// =========================

exports.getDashboardStats = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        // Total approved questions

        const totalQuestions =
            await MainsQuestion.countDocuments({

                reviewStatus: "Approved"
            });

        // User's completed

        const completed =
            await MainsAttempt.countDocuments({

                userId,

                completed: true
            });

        const remaining =
            Math.max(
                totalQuestions - completed,
                0
            );

        const completionPercentage =
            totalQuestions > 0

                ? Math.round(
                    (completed / totalQuestions) * 100
                )

                : 0;

        // =========================
        // TIME-BASED COUNTS
        // =========================

        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(
            now.getDate() - now.getDay()
        );
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const [
            doneToday,
            doneThisWeek,
            doneThisMonth
        ] = await Promise.all([

            MainsAttempt.countDocuments({
                userId,
                completed: true,
                completedAt: {
                    $gte: startOfDay
                }
            }),

            MainsAttempt.countDocuments({
                userId,
                completed: true,
                completedAt: {
                    $gte: startOfWeek
                }
            }),

            MainsAttempt.countDocuments({
                userId,
                completed: true,
                completedAt: {
                    $gte: startOfMonth
                }
            })
        ]);

        res.json({

            totalQuestions,

            completed,

            remaining,

            completionPercentage,

            doneToday,

            doneThisWeek,

            doneThisMonth
        });

    } catch (err) {

        console.error(
            "Mains Dashboard Stats Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// PAPER-WISE PROGRESS
// =========================

exports.getPaperProgress = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        const papers =
            [
                'GS1',
                'GS2',
                'GS3',
                'GS4',
                'Essay',
                'Optional'
            ];

        const result = [];

        for (const paper of papers) {

            const total =
                await MainsQuestion.countDocuments({

                    paper,

                    reviewStatus: "Approved"
                });

            const completedAttempts =
                await MainsAttempt.aggregate([

                    {
                        $match: {
                            userId,
                            completed: true
                        }
                    },

                    {
                        $lookup: {

                            from: "mainsquestions",

                            localField:
                                "questionId",

                            foreignField:
                                "_id",

                            as: "question"
                        }
                    },

                    {
                        $unwind: "$question"
                    },

                    {
                        $match: {
                            "question.paper":
                                paper
                        }
                    },

                    {
                        $count: "count"
                    }
                ]);

            const completed =
                completedAttempts[0]?.count || 0;

            result.push({

                paper,

                total,

                completed,

                remaining:
                    Math.max(total - completed, 0),

                percentage:
                    total > 0
                        ? Math.round(
                            (completed / total) * 100
                          )
                        : 0
            });
        }

        res.json(result);

    } catch (err) {

        console.error(
            "Paper Progress Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// SUBJECT-WISE PROGRESS
// =========================

exports.getSubjectProgress = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        const allQuestions =
            await MainsQuestion.find({

                reviewStatus: "Approved"

            }).select("_id subjectName");

        const attempts =
            await MainsAttempt.find({

                userId,

                completed: true

            }).select("questionId");

        const completedIds =
            new Set(

                attempts.map(a =>
                    a.questionId.toString()
                )
            );

        const subjectMap = {};

        allQuestions.forEach(q => {

            if (!q.subjectName) return;

            if (!subjectMap[q.subjectName]) {

                subjectMap[q.subjectName] = {

                    name:
                        q.subjectName,

                    total: 0,

                    completed: 0
                };
            }

            subjectMap[q.subjectName].total++;

            if (completedIds.has(
                q._id.toString()
            )) {

                subjectMap[q.subjectName]
                    .completed++;
            }
        });

        const result =

            Object.values(subjectMap)

                .map(s => ({

                    ...s,

                    percentage:
                        s.total > 0
                            ? Math.round(
                                (s.completed / s.total) * 100
                              )
                            : 0
                }))

                .sort((a, b) =>
                    b.percentage - a.percentage
                );

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// TOPIC-WISE PROGRESS
// =========================

exports.getTopicProgress = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        const { paper } = req.query;

        const query = {

            reviewStatus: "Approved"
        };

        if (paper) query.paper = paper;

        const allQuestions =
            await MainsQuestion

                .find(query)

                .select("_id topicName");

        const attempts =
            await MainsAttempt.find({

                userId,

                completed: true

            }).select("questionId");

        const completedIds =
            new Set(

                attempts.map(a =>
                    a.questionId.toString()
                )
            );

        const topicMap = {};

        allQuestions.forEach(q => {

            if (!q.topicName) return;

            if (!topicMap[q.topicName]) {

                topicMap[q.topicName] = {

                    name:
                        q.topicName,

                    total: 0,

                    completed: 0
                };
            }

            topicMap[q.topicName].total++;

            if (completedIds.has(
                q._id.toString()
            )) {

                topicMap[q.topicName]
                    .completed++;
            }
        });

        const result =

            Object.values(topicMap)

                .map(t => ({

                    ...t,

                    percentage:
                        t.total > 0
                            ? Math.round(
                                (t.completed / t.total) * 100
                              )
                            : 0
                }))

                .sort((a, b) =>
                    b.percentage - a.percentage
                );

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// RECENT ACTIVITY
// =========================

exports.getRecentActivity = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        const recent =
            await MainsAttempt

                .find({
                    userId,
                    completed: true
                })

                .sort({
                    completedAt: -1
                })

                .limit(10)

                .populate(
                    "questionId",
                    "questionText paper year marks subjectName"
                );

        const activity =

            recent

                .filter(a => a.questionId)

                .map(a => ({

                    questionId:
                        a.questionId._id,

                    questionText:
                        a.questionId.questionText,

                    paper:
                        a.questionId.paper,

                    year:
                        a.questionId.year,

                    marks:
                        a.questionId.marks,

                    subjectName:
                        a.questionId.subjectName,

                    completedAt:
                        a.completedAt
                }));

        res.json(activity);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};
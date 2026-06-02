const Question =
    require('../models/Question');

// =========================
// REPEATED THEMES
// =========================

exports.getRepeatedThemes =
async (
    req,
    res
) => {

    try {

        const repeatedThemes =
            await Question.aggregate([

                // ONLY REPEATED

                {
                    $match: {

                        isRepeatedConcept:
                            true
                    }
                },

                // GROUP BY HASH

                {
                    $group: {

                        _id:
                            "$normalizedQuestionHash",

                        totalOccurrences: {
                            $sum: 1
                        },

                        years: {
                            $addToSet:
                                "$year"
                        },

                        papers: {
                            $addToSet:
                                "$paper"
                        },

                        subjects: {
                            $addToSet:
                                "$subjectName"
                        },

                        topics: {
                            $addToSet:
                                "$topicName"
                        },

                        sampleQuestion: {
                            $first:
                                "$questionText"
                        },

                        questions: {
                            $push: {

                                _id: "$_id",

                                year: "$year",

                                paper: "$paper",

                                subjectName:
                                    "$subjectName",

                                topicName:
                                    "$topicName",

                                questionText:
                                    "$questionText"
                            }
                        }
                    }
                },

                // SORT MOST REPEATED

                {
                    $sort: {

                        totalOccurrences:
                            -1
                    }
                }

            ]);

        res.json(
            repeatedThemes
        );

    } catch (error) {

        console.error(
            "Repeated Theme Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// SUBJECT TREND HEATMAP
// =========================

exports.getSubjectTrendHeatmap =
async (
    req,
    res
) => {

    try {

        const trends =
            await Question.aggregate([

                {
                    $match: {

                        subjectName: {
                            $exists: true,
                            $ne: null,
                            $ne: ""
                        }
                    }
                },

                {
                    $group: {

                        _id: {

                            year: "$year",

                            subject:
                                "$subjectName"
                        },

                        count: {
                            $sum: 1
                        }
                    }
                },

                {
                    $project: {

                        _id: 0,

                        year:
                            "$_id.year",

                        subject:
                            "$_id.subject",

                        count: 1
                    }
                },

                {
                    $sort: {

                        year: 1,

                        count: -1
                    }
                }

            ]);

        res.json(
            trends
        );

    } catch (error) {

        console.error(
            "Trend Heatmap Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};
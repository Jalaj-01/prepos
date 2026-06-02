const PreparationTrack =
    require(
        "../models/PreparationTrack"
    );

const Question =
    require(
        "../models/Question"
    );

// =========================
// CREATE TRACK
// =========================

exports.createTrack =
async (
    req,
    res
) => {

    try {

        const {

            title,
            mode,
            selectedYears,
            selectedSubjects,
            selectedTopics,
            dailyQuestionTarget

        } = req.body;

        // =========================
        // MATCH QUERY
        // =========================

        let query = {};

        if (
            selectedYears?.length
        ) {

            query.year = {

                $in:
                    selectedYears
            };
        }

        if (
            selectedTopics?.length
        ) {

            query.taxonomyIds = {

                $in:
                    selectedTopics
            };
        }

        else if (
            selectedSubjects?.length
        ) {

            query.taxonomyIds = {

                $in:
                    selectedSubjects
            };
        }

        // =========================
        // GS / CSAT
        // =========================

        if (mode === "CSAT") {

            query.paper = "CSAT";
        }

        else {

            query.paper = {
                $ne: "CSAT"
            };
        }
        // =========================
// REMOVE OLD SAME-MODE TRACK
// =========================

await PreparationTrack.updateMany(

    {

        userId:
            req.user._id,

        mode,

        isActive: true
    },

    {

        isActive: false
    }
);

        const totalQuestions =
            await Question.countDocuments(
                query
            );

        // =========================
        // CREATE
        // =========================

        const track =
            await PreparationTrack.create({

                userId:
                    req.user._id,

                title,

                mode,

                selectedYears,

                selectedSubjects,

                selectedTopics,

                dailyQuestionTarget,

                totalQuestions
            });

        res.status(201).json(
            track
        );

    } catch (error) {

        console.error(
            "Create Track Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// GET MY TRACKS
// =========================

exports.getMyTrack =
async (
    req,
    res
) => {

    try {

        const tracks =
            await PreparationTrack.find({

                userId:
                    req.user._id,

                isActive: true
            });

        const gsTrack =
            tracks.find(

                t => t.mode === "GS"
            );

        const csatTrack =
            tracks.find(

                t => t.mode === "CSAT"
            );

        res.json({

            gsTrack:
                gsTrack || null,

            csatTrack:
                csatTrack || null
        });

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};
// =========================
// GET TODAY QUESTIONS
// =========================

exports.getTodayQuestions =
async (
    req,
    res
) => {

    try {

        const track =
            await PreparationTrack.findOne({

                userId:
                    req.user._id,

                isActive: true
            });

        if (!track) {

            return res.status(404).json({

                message:
                    "No active track"
            });
        }

        // =========================
        // SUNDAY REVISION
        // =========================

        const today =
            new Date();

        const isSunday =
            today.getDay() === 0;

        if (
            isSunday &&
            track.wrongQuestions.length > 0
        ) {

            const wrongIds =
                track.wrongQuestions.map(

                    q => q.questionId
                );

            const revisionQuestions =
                await Question.find({

                    _id: {
                        $in:
                            wrongIds
                    }
                })

                .limit(
                    track.dailyQuestionTarget
                );

            return res.json({

                mode:
                    "REVISION",

                questions:
                    revisionQuestions
            });
        }

        // =========================
        // NORMAL DAILY FLOW
        // =========================

        let query = {

            _id: {

                $nin:
                    track.solvedQuestions
            }
        };

        if (
            track.selectedYears?.length
        ) {

            query.year = {

                $in:
                    track.selectedYears
            };
        }

        if (
            track.selectedTopics?.length
        ) {

            query.taxonomyIds = {

                $in:
                    track.selectedTopics
            };
        }

        else if (
            track.selectedSubjects?.length
        ) {

            query.taxonomyIds = {

                $in:
                    track.selectedSubjects
            };
        }

        // =========================
        // GS / CSAT
        // =========================

        if (
            track.mode === "CSAT"
        ) {

            query.paper = "CSAT";
        }

        else {

            query.paper = {
                $ne: "CSAT"
            };
        }

        const questions =
            await Question.find(query)

            .limit(
                track.dailyQuestionTarget
            );

        res.json({

            mode:
                track.mode,

            questions
        });

    } catch (error) {

        console.error(
            "Today Questions Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};
// =========================
// GET NEXT QUESTION
// =========================

exports.getNextQuestion =
async (
    req,
    res
) => {

    try {

        const mode =
    req.query.mode || "GS";

const track =
    await PreparationTrack.findOne({

        userId:
            req.user._id,

        mode,

        isActive: true
    });
        if (!track) {

            return res.status(404).json({

                message:
                    "No active preparation track found"
            });
        }
// =========================
// REVISION MODE
// =========================

const today =
    new Date();

const isSunday =
    today.getDay() === 0;

// WEEKLY REVISION ONLY

if (

    isSunday &&

    track.wrongQuestions.length > 0

) {

    const sortedWrongQuestions =
        [...track.wrongQuestions]

            .sort((a, b) =>

                b.wrongCount -
                a.wrongCount
            );

    const revisionQuestionIds =
        sortedWrongQuestions

            .slice(
                0,
                track.dailyQuestionTarget
            )

            .map(
                q => q.questionId
            );

    const revisionQuestions =
        await Question.find({

            _id: {
                $in:
                    revisionQuestionIds
            }
        })

        .sort({
            year: -1
        });

    return res.json({

        mode:
            "REVISION",

        completed:
            false,

        questions:
            revisionQuestions
    });
}

        // =========================
        // BUILD REMAINING QUEUE
        // =========================

        if (
            !track.remainingQuestionIds ||
            track.remainingQuestionIds.length === 0
        ) {

            let query = {

                _id: {

                    $nin:
                        track.solvedQuestions
                }
            };

            // YEARS

            if (
                track.selectedYears?.length
            ) {

                query.year = {

                    $in:
                        track.selectedYears
                };
            }

            // TOPICS

            if (
                track.selectedTopics?.length
            ) {

                query.taxonomyIds = {

                    $in:
                        track.selectedTopics
                };
            }

            // SUBJECTS

            else if (
                track.selectedSubjects?.length
            ) {

                query.taxonomyIds = {

                    $in:
                        track.selectedSubjects
                };
            }

            // GS / CSAT

            if (
                track.mode === "CSAT"
            ) {

                query.paper = "CSAT";
            }

            else {

                query.paper = {
                    $ne: "CSAT"
                };
            }

            const remainingQuestions =
                await Question.find(query)

                    .sort({

                        year: -1,

                        createdAt: 1
                    })

                    .select("_id");

            track.remainingQuestionIds =
                remainingQuestions.map(

                    q => q._id
                );

            await track.save();
        }

        // =========================
        // COMPLETION CHECK
        // =========================

        if (
            track.remainingQuestionIds.length === 0
        ) {

            return res.json({

                completed:
                    true,

                message:
                    "All questions completed",

                stats: {

                    solved:
                        track.solvedQuestions.length,

                    wrong:
                        track.wrongQuestions.length
                }
            });
        }

        // =========================
        // FETCH NEXT QUESTION
        // =========================

        const nextQuestionId =
            track.remainingQuestionIds[0];

        const question =
            await Question.findById(
                nextQuestionId
            );

        track.lastSessionAt =
            new Date();

        await track.save();

        return res.json({

            completed:
                false,

            mode:
                track.mode,

            progress: {

                solved:
                    track.solvedQuestions.length,

                remaining:
                    track.remainingQuestionIds.length,

                total:
                    track.totalQuestions
            },

            question
        });

    } catch (error) {

        console.error(
            "Next Question Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};
// =========================
// SUBMIT ANSWER
// =========================

exports.submitAnswer =
async (
    req,
    res
) => {

    try {

        const {

            questionId,
            isCorrect,
            subjectName,
            topicName

        } = req.body;

       const mode =
    req.body.mode || "GS";

const track =
    await PreparationTrack.findOne({

        userId:
            req.user._id,

        mode,

        isActive: true
    });

        if (!track) {

            return res.status(404).json({

                message:
                    "No active track found"
            });
        }

        // =========================
// REMOVE FROM REMAINING
// ONLY WHEN CORRECT
// =========================

if (isCorrect) {

    track.remainingQuestionIds =
        track.remainingQuestionIds.filter(

            id =>
                id.toString() !==
                questionId.toString()
        );
}

        // =========================
        // CORRECT ANSWER
        // =========================

        if (isCorrect) {

            const alreadySolved =
                track.solvedQuestions.some(

                    id =>
                        id.toString() ===
                        questionId
                );

            if (!alreadySolved) {

                track.solvedQuestions.push(
                    questionId
                );
            }
        }

        // =========================
        // WRONG ANSWER
        // =========================

        else {

            const existingWrong =
                track.wrongQuestions.find(

                    q =>
                       q.questionId.toString() ===
questionId.toString()
                );

            if (existingWrong) {

                existingWrong.wrongCount += 1;

                existingWrong.wrongDate =
                    new Date();
            }

            else {

                track.wrongQuestions.push({

                    questionId,

                    wrongCount: 1,

                    wrongDate:
                        new Date()
                });
            }
        }

        // =========================
        // SUBJECT PROGRESS
        // =========================

        if (subjectName) {

            const currentCount =
                track.subjectProgress.get(
                    subjectName
                ) || 0;

            track.subjectProgress.set(

                subjectName,

                currentCount + 1
            );
        }

        // =========================
        // TOPIC PROGRESS
        // =========================

        if (topicName) {

            const currentCount =
                track.topicProgress.get(
                    topicName
                ) || 0;

            track.topicProgress.set(

                topicName,

                currentCount + 1
            );
        }

        // =========================
        // SESSION
        // =========================

        track.sessionCount += 1;

        track.currentQuestionIndex += 1;

        await track.save();

        res.json({

            success: true,

            remaining:
                track.remainingQuestionIds.length,

            solved:
                track.solvedQuestions.length
        });

    } catch (error) {

        console.error(
            "Submit Answer Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};
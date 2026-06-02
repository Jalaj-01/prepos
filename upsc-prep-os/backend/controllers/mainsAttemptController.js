const MainsAttempt =
    require("../models/MainsAttempt");

const MainsQuestion =
    require("../models/MainsQuestion");

// =========================
// TOGGLE DONE / NOT DONE
// =========================

exports.toggleComplete = async (
    req,
    res
) => {

    try {

        const { questionId } = req.params;

        // Verify question exists

        const question =
            await MainsQuestion.findById(
                questionId
            );

        if (!question) {

            return res.status(404).json({
                message: "Question not found"
            });
        }

        let attempt =
            await MainsAttempt.findOne({

                userId:
                    req.user._id,

                questionId
            });

        if (attempt) {

            // Toggle

            attempt.completed =
                !attempt.completed;

            attempt.completedAt =
                attempt.completed
                    ? new Date()
                    : null;

            await attempt.save();

        } else {

            // Create as completed

            attempt =
                await MainsAttempt.create({

                    userId:
                        req.user._id,

                    questionId,

                    completed: true,

                    completedAt:
                        new Date()
                });
        }

        res.json({

            message:
                attempt.completed
                    ? "Marked as done"
                    : "Marked as not done",

            attempt
        });

    } catch (err) {

        console.error(
            "Toggle Complete Error:",
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

        const { questionId } = req.params;

        let attempt =
            await MainsAttempt.findOne({

                userId:
                    req.user._id,

                questionId
            });

        if (attempt) {

            attempt.bookmarked =
                !attempt.bookmarked;

            await attempt.save();

        } else {

            attempt =
                await MainsAttempt.create({

                    userId:
                        req.user._id,

                    questionId,

                    completed: false,

                    bookmarked: true
                });
        }

        res.json({

            message:
                attempt.bookmarked
                    ? "Bookmarked"
                    : "Bookmark removed",

            attempt
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// SAVE NOTES
// =========================

exports.saveNotes = async (
    req,
    res
) => {

    try {

        const { questionId } = req.params;

        const { notes } = req.body;

        let attempt =
            await MainsAttempt.findOne({

                userId:
                    req.user._id,

                questionId
            });

        if (attempt) {

            attempt.notes = notes;

            await attempt.save();

        } else {

            attempt =
                await MainsAttempt.create({

                    userId:
                        req.user._id,

                    questionId,

                    completed: false,

                    notes
                });
        }

        res.json({

            message: "Notes saved",

            attempt
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET MY BOOKMARKED
// =========================

exports.getMyBookmarked = async (
    req,
    res
) => {

    try {

        const attempts =
            await MainsAttempt

                .find({

                    userId:
                        req.user._id,

                    bookmarked: true
                })

                .populate("questionId")

                .sort({
                    updatedAt: -1
                });

        const questions =
            attempts

                .filter(a => a.questionId)

                .map(a => ({

                    ...a.questionId.toObject(),

                    isCompleted:
                        a.completed,

                    isBookmarked:
                        true,

                    userNotes:
                        a.notes
                }));

        res.json(questions);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};
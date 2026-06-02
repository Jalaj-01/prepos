const User =
    require("../models/User");

const Question =
    require("../models/Question");

// =========================
// TOGGLE BOOKMARK (PER-USER)
// =========================

exports.toggleBookmark = async (
    req,
    res
) => {

    try {

        const questionId = req.params.id;

        const userId = req.user._id;

        // Verify question exists

        const question =
            await Question.findById(questionId);

        if (!question) {

            return res.status(404).json({
                message: "Question not found"
            });
        }

        // Get user

        const user =
            await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check if already bookmarked

        const isAlreadyBookmarked =
            user.bookmarkedQuestions.some(
                id => id.toString() === questionId.toString()
            );

        if (isAlreadyBookmarked) {

            // REMOVE bookmark

            user.bookmarkedQuestions =
                user.bookmarkedQuestions.filter(
                    id => id.toString() !== questionId.toString()
                );

            await user.save();

            return res.json({

                success: true,

                isBookmarked: false,

                message: "Bookmark removed",

                totalBookmarks:
                    user.bookmarkedQuestions.length
            });

        } else {

            // ADD bookmark

            user.bookmarkedQuestions.push(questionId);

            await user.save();

            return res.json({

                success: true,

                isBookmarked: true,

                message: "Question bookmarked",

                totalBookmarks:
                    user.bookmarkedQuestions.length
            });
        }

    } catch (error) {

        console.error(
            "Bookmark Toggle Error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// GET MY BOOKMARKED QUESTIONS (PER-USER)
// =========================

exports.getBookmarkedQuestions = async (
    req,
    res
) => {

    try {

        const userId = req.user._id;

        // Get user with populated bookmarks

        const user =
            await User.findById(userId)
                .populate({
                    path: "bookmarkedQuestions",
                    options: {
                        sort: { year: -1 }
                    }
                });

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }

        // Filter out any null references (deleted questions)

        const validBookmarks =
            user.bookmarkedQuestions.filter(
                q => q !== null && q !== undefined
            );

        res.json(validBookmarks);

    } catch (error) {

        console.error(
            "Fetch Bookmarks Error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// CHECK IF QUESTION IS BOOKMARKED (for frontend)
// =========================

exports.checkBookmarkStatus = async (
    req,
    res
) => {

    try {

        const questionIds =
            req.body.questionIds || [];

        const userId = req.user._id;

        const user =
            await User.findById(userId)
                .select("bookmarkedQuestions");

        if (!user) {

            return res.json({
                bookmarkedIds: []
            });
        }

        const bookmarkedSet =
            new Set(
                user.bookmarkedQuestions.map(
                    id => id.toString()
                )
            );

        const bookmarkedIds =
            questionIds.filter(
                id => bookmarkedSet.has(id.toString())
            );

        res.json({
            bookmarkedIds
        });

    } catch (error) {

        console.error(
            "Check Bookmark Error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};
const Question =
    require('../models/Question');

// =========================
// TOGGLE BOOKMARK
// =========================

exports.toggleBookmark =
async (
    req,
    res
) => {

    try {

        const question =
            await Question.findById(
                req.params.id
            );

        if (!question) {

            return res.status(404).json({

                message:
                    "Question not found"
            });
        }

        question.isBookmarked =
            !question.isBookmarked;

        // OPTIONAL NOTE

        if (
            req.body.bookmarkNote !==
            undefined
        ) {

            question.bookmarkNote =
                req.body.bookmarkNote;
        }

        await question.save();

        res.json({

            success: true,

            isBookmarked:
                question.isBookmarked,

            bookmarkNote:
                question.bookmarkNote
        });

    } catch (error) {

        console.error(
            "Bookmark Toggle Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// GET BOOKMARKED QUESTIONS
// =========================

exports.getBookmarkedQuestions =
async (
    req,
    res
) => {

    try {

        const questions =
            await Question.find({

                isBookmarked: true
            })

            .sort({
                updatedAt: -1
            });

        res.json(questions);

    } catch (error) {

        console.error(
            "Fetch Bookmarks Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};
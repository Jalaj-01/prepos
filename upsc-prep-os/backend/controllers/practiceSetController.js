const PracticeSet =
    require(
        "../models/PracticeSet"
    );

// =========================
// CREATE PRACTICE SET
// =========================

exports.createPracticeSet =
async (
    req,
    res
) => {

    try {

        const {

            title,
            description,
            questions

        } = req.body;

        const practiceSet =
            await PracticeSet.create({

                userId:
                    req.user._id,

                title,

                description,

                questions
            });

        res.status(201).json(
            practiceSet
        );

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// GET USER SETS
// =========================

exports.getPracticeSets =
async (
    req,
    res
) => {

    try {

        const sets =
            await PracticeSet.find({

                userId:
                    req.user._id

            })

            .populate(
                "questions"
            )

            .sort({
                createdAt: -1
            });

        res.json(sets);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// DELETE SET
// =========================

exports.deletePracticeSet =
async (
    req,
    res
) => {

    try {

        await PracticeSet.findOneAndDelete({

            _id:
                req.params.id,

            userId:
                req.user._id
        });

        res.json({

            message:
                "Practice set deleted"
        });

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};
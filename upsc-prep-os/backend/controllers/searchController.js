const Question =
    require("../models/Question");

// =========================
// SMART QUESTION SEARCH
// =========================

exports.searchQuestions =
async (
    req,
    res
) => {

    try {

        const {

            q,
            subject,
            topic,
            year,
            paper,
            repeated

        } = req.query;

        // =========================
        // BUILD FILTERS
        // =========================

        let filters = {};

        // KEYWORD SEARCH

        if (q) {

            filters.$or = [

                {
                    questionText: {

                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    "aiMetadata.subject": {

                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    "aiMetadata.topic": {

                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    "aiMetadata.subtopic": {

                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    tags: {

                        $elemMatch: {

                            $regex: q,
                            $options: "i"
                        }
                    }
                }
            ];
        }

        // SUBJECT

        if (subject) {

            filters[
                "aiMetadata.subject"
            ] = {

                $regex: subject,
                $options: "i"
            };
        }

        // TOPIC

        if (topic) {

            filters[
                "aiMetadata.topic"
            ] = {

                $regex: topic,
                $options: "i"
            };
        }

        // YEAR

        if (year) {

            filters.year =
                Number(year);
        }

        // PAPER

        if (paper) {

            filters.paper =
                paper;
        }

        // REPEATED ONLY

        if (
            repeated === "true"
        ) {

            filters.isRepeatedConcept =
                true;
        }

        // =========================
        // FETCH
        // =========================

        const questions =
            await Question.find(
                filters
            )

            .sort({
                year: -1
            })

            .limit(200);

        res.json(
            questions
        );

    } catch (error) {

        console.error(
            "Search Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};
const Question = require('../models/Question');

const mongoose = require('mongoose');

const {
    findOrCreateTaxonomyHierarchy
} = require('./taxonomyController');

const CryptoJS =
    require("crypto-js");


// =========================
// NORMALIZE QUESTION
// =========================
const normalizeQuestion =
(
    text = ""
) => {

    return text

        .toLowerCase()

        // remove punctuation

        .replace(/[^\w\s]/gi, "")

        // collapse spaces

        .replace(/\s+/g, " ")

        .trim();
};

// =========================
// HASH QUESTION
// =========================

const generateQuestionHash =
(
    questionText
) => {

    const normalized =
        normalizeQuestion(
            questionText
        );

    return CryptoJS.SHA256(
        normalized
    ).toString();
};
// =========================
// CREATE SINGLE QUESTION
// =========================

exports.createQuestion = async (
    req,
    res
) => {

    try {

        let images = [];

        // IMAGE HANDLING

        if (
            req.files &&
            req.files.length > 0
        ) {

            images =
                req.files.map(file => ({

                    url: file.path,

                    cloudinaryId:
                        file.filename,

                    caption: '',

                    pageNumber: null
                }));
        }

        const payload = {

            ...req.body,

            images
        };

        // =========================
        // PARSE ARRAYS
        // =========================

        if (
            typeof payload.options ===
            'string'
        ) {

            payload.options =
                JSON.parse(
                    payload.options
                );
        }

        if (
            typeof payload.taxonomyIds ===
            'string'
        ) {

            payload.taxonomyIds =
                JSON.parse(
                    payload.taxonomyIds
                );
        }

        // =========================
        // HASH
        // =========================

        payload.normalizedQuestionHash =
            generateQuestionHash(
                payload.questionText
            );


        // =========================
        // DUPLICATE BLOCK
        // =========================

        const existingQuestion =
            await Question.findOne({

                normalizedQuestionHash:
                    payload.normalizedQuestionHash,

                year:
                    payload.year
            });

        if (existingQuestion) {

            return res.status(409).json({

                message:
                    "Duplicate question already exists for this year"
            });
        }

        // =========================
        // REPEATED CONCEPT
        // =========================

        const repeatedQuestion =
            await Question.findOne({

                normalizedQuestionHash:
                    payload.normalizedQuestionHash,

                year: {
                    $ne: payload.year
                }
            });

        if (repeatedQuestion) {

            payload.isRepeatedConcept =
                true;
        }

        // =========================
        // AUTO TAXONOMY LINKING
        // =========================

        if (payload.aiMetadata) {

            const taxonomyIds =
                await findOrCreateTaxonomyHierarchy(

                    payload.aiMetadata.subject,

                    payload.aiMetadata.topic,

                    payload.aiMetadata.subtopic
                );

            payload.taxonomyIds =
                taxonomyIds;

            payload.subjectName =
                payload.aiMetadata.subject;

            payload.topicName =
                payload.aiMetadata.topic;

            payload.subtopicName =
                payload.aiMetadata.subtopic;

            payload.keywords =
                payload.aiMetadata.keywords || [];
        }

        // =========================
        // CREATE
        // =========================

        const question =
            await Question.create(
                payload,
                
            );

        res.status(201).json(
            question
        );

    } catch (error) {

        console.error(
            "Create Question Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// BULK QUESTION INSERT
// =========================

exports.addBulkQuestions = async (
    req,
    res
) => {

    try {

        const {
            questions
        } = req.body;

        if (
            !questions ||
            !Array.isArray(questions)
        ) {

            return res.status(400).json({

                message:
                    "Questions array is required"
            });
        }

        const finalQuestions = [];

        let skipped = 0;

        for (const question of questions) {

            // =========================
            // HASH
            // =========================

            const hash =
                generateQuestionHash(
                    question.questionText
                );

            question.normalizedQuestionHash =
                hash;

            // =========================
            // DUPLICATE CHECK
            // =========================

            const exists =
                await Question.findOne({

                    normalizedQuestionHash:
                        hash,

                    year:
                        question.year
                });

            if (exists) {

                skipped++;

                continue;
            }

            // =========================
            // REPEATED CONCEPT
            // =========================

            const repeated =
                await Question.findOne({

                    normalizedQuestionHash:
                        hash,

                    year: {
                        $ne: question.year
                    }
                });

            if (repeated) {

                question.isRepeatedConcept =
                    true;
            }

            // =========================
            // TAXONOMY LINKING
            // =========================

            if (question.aiMetadata) {

                const taxonomyIds =
                    await findOrCreateTaxonomyHierarchy(

                        question.aiMetadata.subject,

                        question.aiMetadata.topic,

                        question.aiMetadata.subtopic
                    );

                question.taxonomyIds =
                    taxonomyIds;

                question.subjectName =
                    question.aiMetadata.subject;

                question.topicName =
                    question.aiMetadata.topic;

                question.subtopicName =
                    question.aiMetadata.subtopic;

                question.keywords =
                    question.aiMetadata.keywords || [];
            }

            finalQuestions.push(
                question
            );
        }

        // =========================
        // INSERT
        // =========================

        const createdQuestions =
            await Question.insertMany(
                finalQuestions
            );

        res.status(201).json({

            message:
                "Bulk upload successful",

            inserted:
                createdQuestions.length,

            skipped,

            data:
                createdQuestions
        });

    } catch (error) {

        console.error(
            "Bulk Upload Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// GET QUESTIONS BY TOPIC
// =========================

exports.getQuestionsByTopic =
async (
    req,
    res
) => {

    try {

        const questions =
            await Question.find({

                taxonomyIds:
                    req.params.topicId
            });

        res.json(questions);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// DAILY RANDOM QUESTIONS
// =========================

exports.getDailyQuestions =
async (
    req,
    res
) => {

    try {

        const {

            limit,

            subjects,

            topics,

            years

        } = req.query;

        let matchQuery = {};

        // TOPICS

        if (topics) {

            const topicIds =
                topics

                    .split(',')

                    .map(id =>

                        new mongoose.Types.ObjectId(
                            id.trim()
                        )
                    );

            matchQuery.taxonomyIds = {
                $in: topicIds
            };
        }

        // SUBJECTS

        else if (subjects) {

            const subjectIds =
                subjects

                    .split(',')

                    .map(id =>

                        new mongoose.Types.ObjectId(
                            id.trim()
                        )
                    );

            matchQuery.taxonomyIds = {
                $in: subjectIds
            };
        }

        // YEARS

        if (years) {

            const yearArray =
                years

                    .split(',')

                    .map(Number);

            matchQuery.year = {
                $in: yearArray
            };
        }

        const countLimit =
            parseInt(limit) || 10;

        const questions =
            await Question.aggregate([

                {
                    $match:
                        matchQuery
                },

                {
                    $sample: {
                        size:
                            countLimit
                    }
                }
            ]);

        res.json(questions);

    } catch (error) {

        console.error(
            "Daily Question Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// GET QUESTIONS BY REVIEW STATUS
// =========================

exports.getQuestionsByReviewStatus =
async (
    req,
    res
) => {

    try {

        const status =
            req.query.status ||
            'Pending';

        const questions =
            await Question.find({

                reviewStatus:
                    status
            })

            .populate(
                'taxonomyIds'
            )

            .sort({
                createdAt: -1
            });

        res.json(questions);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// UPDATE REVIEW STATUS
// =========================

exports.updateReviewStatus =
async (
    req,
    res
) => {

    try {

        const {
            reviewStatus
        } = req.body;

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

        question.reviewStatus =
            reviewStatus;

        question.reviewedAt =
            new Date();

        question.reviewedBy =
            req.user._id;

        await question.save();

        res.json({

            message:
                "Review updated"
        });

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// EXPLORE QUESTIONS
// =========================

exports.exploreQuestions =
async (
    req,
    res
) => {

    try {

        const {

            year,

            subject,

            topic,

            paper,

            search

        } = req.query;

        const query = {};

        // YEAR

        if (year) {

            query.year =
                Number(year);
        }

        // SUBJECT

        if (subject) {

            query.subjectName = {

                $regex: subject,

                $options: "i"
            };
        }

        // TOPIC

        if (topic) {

            query.topicName = {

                $regex: topic,

                $options: "i"
            };
        }

        // PAPER

        if (paper) {

            query.paper = paper;
        }

        // SEARCH

        if (search) {

            query.questionText = {

                $regex: search,

                $options: "i"
            };
        }

        const questions =
            await Question.find(query)

            .sort({

                year: -1,

                createdAt: -1
            })

            .limit(200);

        res.json(questions);

    } catch (error) {

        console.error(
            "Explore Questions Error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch questions"
        });
    }
};
// =========================
// GET QUESTION FILTER OPTIONS
// (For dropdowns in free practice)
// =========================

exports.getQuestionFilters = async (
    req,
    res
) => {

    try {

        const [
            subjects,
            topics,
            years,
            papers
        ] = await Promise.all([

            Question.distinct("subjectName"),

            Question.distinct("topicName"),

            Question.distinct("year"),

            Question.distinct("paper")
        ]);

        res.json({

            subjects:
                subjects.filter(Boolean).sort(),

            topics:
                topics.filter(Boolean).sort(),

            years:
                years.filter(Boolean).sort((a, b) => b - a),

            papers:
                papers.filter(Boolean).sort()
        });

    } catch (error) {

        console.error("Question Filters Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

const Question = require('../models/Question');
const mongoose = require('mongoose');
const crypto = require('crypto');


const {
    findOrCreateTaxonomyHierarchy
} = require('./taxonomyController');


// =========================
// NORMALIZED HASH GENERATOR
// =========================

const generateQuestionHash = (
    questionText
) => {

    const normalized =
        questionText

            .toLowerCase()

            .replace(/[^\w\s]/g, '')

            .replace(/\s+/g, ' ')

            .trim();

    return crypto
        .createHash('sha256')
        .update(normalized)
        .digest('hex');
};


// =========================
// CREATE SINGLE QUESTION
// =========================

exports.createQuestion = async (req, res) => {

    try {

        let images = [];

        // Handle uploaded images
        if (req.files && req.files.length > 0) {

            images = req.files.map(file => ({
                url: file.path,
                cloudinaryId: file.filename,
                caption: '',
                pageNumber: null
            }));
        }

        const payload = {
            ...req.body,
            images
        };

        // Parse stringified arrays
        if (typeof payload.options === 'string') {
            payload.options = JSON.parse(payload.options);
        }

        if (typeof payload.taxonomyIds === 'string') {
            payload.taxonomyIds = JSON.parse(payload.taxonomyIds);
        }

        // =========================
        // DUPLICATE HASH
        // =========================

        payload.normalizedQuestionHash =
            generateQuestionHash(
                payload.questionText
            );

        // SAME QUESTION + SAME YEAR
        // BLOCK INSERT

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

        // SAME QUESTION + DIFFERENT YEAR
        // MARK REPEATED CONCEPT

        const repeatedQuestion =
            await Question.findOne({

                normalizedQuestionHash:
                    payload.normalizedQuestionHash,

                year: {
                    $ne: payload.year
                }
            });

        if (repeatedQuestion) {

            payload.isRepeatedConcept = true;
        }

        const question =
            await Question.create(payload);

        res.status(201).json(question);

    } catch (error) {

        console.error(
            "Create Question Error:",
            error
        );

        res.status(500).json({
            message: error.message
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

        const { questions } = req.body;

        if (
            !questions ||
            !Array.isArray(questions)
        ) {

            return res.status(400).json({
                message:
                    "Questions array is required"
            });
        }

        let filteredQuestions = [];

        for (let question of questions) {

            // =========================
            // NORMALIZED HASH
            // =========================

            const questionHash =
                generateQuestionHash(
                    question.questionText
                );

            question.normalizedQuestionHash =
                questionHash;

            // =========================
            // EXACT DUPLICATE CHECK
            // SAME QUESTION + SAME YEAR
            // =========================

            const existingQuestion =
                await Question.findOne({

                    normalizedQuestionHash:
                        questionHash,

                    year:
                        question.year
                });

            if (existingQuestion) {

                console.log(
                    `Duplicate blocked: ${question.questionText}`
                );

                continue;
            }

            // =========================
            // REPEATED CONCEPT CHECK
            // SAME QUESTION + DIFFERENT YEAR
            // =========================

            const repeatedConcept =
                await Question.findOne({

                    normalizedQuestionHash:
                        questionHash,

                    year: {
                        $ne: question.year
                    }
                });

            if (repeatedConcept) {

                question.isRepeatedConcept =
                    true;
            }

            // =========================
            // AUTO TAXONOMY LINKING
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
            }

            filteredQuestions.push(question);
        }

        const finalQuestions = [];

for (const question of questions) {

    const hash =
        generateQuestionHash(
            question.questionText
        );

    const exists =
        await Question.findOne({

            normalizedQuestionHash: hash,

            year: question.year
        });

    if (!exists) {

        finalQuestions.push({

            ...question,

            normalizedQuestionHash: hash
        });
    }
}

const createdQuestions =
    await Question.insertMany(
        finalQuestions
    );

        res.status(201).json({

            message:
                "Bulk upload successful",

            inserted:
                createdQuestions.length,

            skipped:
                questions.length -
                filteredQuestions.length,

            data:
                createdQuestions
        });

    } catch (error) {

        console.error(
            "Bulk Upload Error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


// =========================
// GET QUESTIONS BY TOPIC
// =========================

exports.getQuestionsByTopic = async (
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
            message: error.message
        });
    }
};


// =========================
// DAILY RANDOM QUESTIONS
// =========================

exports.getDailyQuestions = async (
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

        // Topic filter
        if (topics) {

            const topicIds = topics
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

        // Subject filter
        else if (subjects) {

            const subjectIds = subjects
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

        // Year filter
        if (years) {

            const yearArray = years
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

                { $match: matchQuery },

                {
                    $sample: {
                        size: countLimit
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
            message: error.message
        });
    }
};


// =========================
// GET QUESTIONS BY REVIEW STATUS
// =========================

exports.getQuestionsByReviewStatus = async (
    req,
    res
) => {

    try {

        const status =
            req.query.status || 'Pending';

        const questions =
            await Question.find({
                reviewStatus: status
            })
            .populate('taxonomyIds')
            .sort({
                createdAt: -1
            });

        res.json(questions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =========================
// UPDATE REVIEW STATUS
// =========================

exports.updateReviewStatus = async (
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
            message: error.message
        });
    }
};

exports.exploreQuestions = async (
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
        // const query = {

        //     reviewStatus: "Approved"
        // };
// later we will un comment this ablove 
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
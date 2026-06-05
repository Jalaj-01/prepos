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
        const skippedDetails = [];

        let skipped = 0;

       for (const question of questions) {

    // ─── SANITIZE — strip bad enum values that AI sometimes generates ───
    const VALID_FORMAT = ['Text', 'Image', 'Table', 'Mixed'];
    const VALID_QTYPE = [
        'Factual',
        'Conceptual',
        'Statement Based',
        'Match the Following',
        'Assertion Reason',
        'Map Based',
        'Chronology',
        'Table Based',
        'Image Based'
    ];
    const VALID_DIFF = ['Easy', 'Medium', 'Hard'];
    const VALID_PAPER = ['GS1', 'GS2', 'GS3', 'GS4', 'Essay', 'Optional', 'CSAT'];

    // Fix top-level questionFormat
    if (!VALID_FORMAT.includes(question.questionFormat)) {
        question.questionFormat = 'Text';
    }

    // Fix difficulty
    if (!VALID_DIFF.includes(question.difficulty)) {
        question.difficulty = 'Medium';
    }

    // Fix paper
    if (!VALID_PAPER.includes(question.paper)) {
        question.paper = 'GS1';
    }

    // Fix aiMetadata nested fields
    if (question.aiMetadata) {
        if (!VALID_QTYPE.includes(question.aiMetadata.questionType)) {
            question.aiMetadata.questionType = 'Factual';
        }
        if (!VALID_DIFF.includes(question.aiMetadata.difficultyPrediction)) {
            question.aiMetadata.difficultyPrediction = 'Medium';
        }
    }
    // ─── END SANITIZE ───

    // ... rest of your existing code (hash generation, duplicate check, etc.)

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

    skippedDetails.push({
        questionText:
            (question.questionText || "").substring(0, 80) + "...",
        year: question.year,
        reason: "Duplicate of existing question in DB"
    });

    continue;
}

// ── Check batch duplicates too ──
const alreadyInBatch = finalQuestions.find(
    (q) =>
        q.normalizedQuestionHash === hash &&
        q.year === question.year
);

if (alreadyInBatch) {

    skipped++;

    skippedDetails.push({
        questionText:
            (question.questionText || "").substring(0, 80) + "...",
        year: question.year,
        reason: "Duplicate within this upload batch"
    });

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

    skippedDetails,

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
// =========================
// UPDATE QUESTION (Admin)
// PUT /api/questions/:id
// =========================
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // If question text changed, regenerate hash
        if (updates.questionText) {
            updates.normalizedQuestionHash = generateQuestionHash(
                updates.questionText
            );
        }

        // Parse arrays if sent as strings (from form-data uploads)
        if (typeof updates.options === "string") {
            updates.options = JSON.parse(updates.options);
        }
        if (typeof updates.taxonomyIds === "string") {
            updates.taxonomyIds = JSON.parse(updates.taxonomyIds);
        }
        if (typeof updates.keywords === "string") {
            try {
                updates.keywords = JSON.parse(updates.keywords);
            } catch {
                updates.keywords = updates.keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean);
            }
        }

        // Auto-link taxonomy if subject/topic changed
        if (updates.subjectName || updates.topicName || updates.subtopicName) {
            const taxonomyIds = await findOrCreateTaxonomyHierarchy(
                updates.subjectName,
                updates.topicName,
                updates.subtopicName
            );
            updates.taxonomyIds = taxonomyIds;
        }

        const updated = await Question.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json({
            message: "Question updated successfully",
            question: updated,
        });
    } catch (err) {
        console.error("updateQuestion:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// DELETE SINGLE QUESTION (Admin)
// DELETE /api/questions/:id
// Cascades: removes attempts + bookmarks
// =========================
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid question id" });
        }

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Cascade
        const Attempt = require("../models/Attempt");
        const User = require("../models/User");

        await Promise.all([
            Attempt.deleteMany({ question: id }).catch(() => null),
            User.updateMany(
                { bookmarkedQuestions: id },
                { $pull: { bookmarkedQuestions: id } }
            ).catch(() => null),
        ]);

        await Question.findByIdAndDelete(id);

        res.json({ message: "Question deleted permanently" });
    } catch (err) {
        console.error("deleteQuestion:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// BULK DELETE (Admin)
// POST /api/questions/bulk-delete   body: { ids: [...] }
// =========================
exports.bulkDeleteQuestions = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res
                .status(400)
                .json({ message: "ids array is required" });
        }

        const validIds = ids.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
        );
        if (validIds.length === 0) {
            return res.status(400).json({ message: "No valid ids" });
        }

        const Attempt = require("../models/Attempt");
        const User = require("../models/User");

        const [deletedRes] = await Promise.all([
            Question.deleteMany({ _id: { $in: validIds } }),
            Attempt.deleteMany({ question: { $in: validIds } }).catch(
                () => null
            ),
            User.updateMany(
                { bookmarkedQuestions: { $in: validIds } },
                { $pull: { bookmarkedQuestions: { $in: validIds } } }
            ).catch(() => null),
        ]);

        res.json({
            message: `${deletedRes.deletedCount} question(s) deleted`,
            deletedCount: deletedRes.deletedCount,
        });
    } catch (err) {
        console.error("bulkDeleteQuestions:", err);
        res.status(500).json({ message: err.message });
    }
};
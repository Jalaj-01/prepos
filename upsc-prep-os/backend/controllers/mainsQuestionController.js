const MainsQuestion =
    require("../models/MainsQuestion");

const MainsAttempt =
    require("../models/MainsAttempt");

const CryptoJS =
    require("crypto-js");

// =========================
// NORMALIZE & HASH
// =========================

const normalizeQuestion = (
    text = ""
) => {

    return text

        .toLowerCase()

        .replace(/[^\w\s]/gi, "")

        .replace(/\s+/g, " ")

        .trim();
};

const generateHash = (
    questionText
) => {

    const normalized =
        normalizeQuestion(questionText);

    return CryptoJS

        .SHA256(normalized)

        .toString();
};

// =========================
// CREATE SINGLE QUESTION
// =========================

exports.createQuestion = async (
    req,
    res
) => {

    try {

        const payload = {
            ...req.body
        };

        payload.normalizedQuestionHash =
            generateHash(
                payload.questionText
            );

        // Duplicate check

        const existing =
            await MainsQuestion.findOne({

                normalizedQuestionHash:
                    payload.normalizedQuestionHash,

                year:
                    payload.year,

                paper:
                    payload.paper
            });

        if (existing) {

            return res.status(409).json({

                message:
                    "Duplicate question exists for this year and paper"
            });
        }

        // Repeated check

        const repeated =
            await MainsQuestion.findOne({

                normalizedQuestionHash:
                    payload.normalizedQuestionHash,

                year: {
                    $ne: payload.year
                }
            });

        if (repeated) {

            payload.isRepeated = true;
        }

        if (req.user) {

            payload.source = {
                ...payload.source,
                uploadedBy:
                    req.user._id
            };
        }

        const question =
            await MainsQuestion.create(payload);

        res.status(201).json(question);

    } catch (err) {

        console.error(
            "Create Mains Question Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// BULK CREATE
// =========================

exports.bulkCreate = async (
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
                    "questions array is required"
            });
        }

        const finalQuestions = [];

        let skipped = 0;

        for (const q of questions) {

            const hash =
                generateHash(q.questionText);

            q.normalizedQuestionHash = hash;

            const exists =
                await MainsQuestion.findOne({

                    normalizedQuestionHash:
                        hash,

                    year: q.year,

                    paper: q.paper
                });

            if (exists) {

                skipped++;

                continue;
            }

            const repeated =
                await MainsQuestion.findOne({

                    normalizedQuestionHash:
                        hash,

                    year: { $ne: q.year }
                });

            if (repeated) {

                q.isRepeated = true;
            }

            if (req.user) {

                q.source = {
                    ...q.source,
                    uploadedBy:
                        req.user._id
                };
            }

            finalQuestions.push(q);
        }

        const created =
            await MainsQuestion.insertMany(
                finalQuestions
            );

        res.status(201).json({

            message:
                "Bulk upload complete",

            inserted:
                created.length,

            skipped,

            data:
                created
        });

    } catch (err) {

        console.error(
            "Mains Bulk Upload Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET ALL (with filters)
// =========================

exports.getAllQuestions = async (
    req,
    res
) => {

    try {

        const {
            paper,
            year,
            subject,
            topic,
            difficulty,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const query = {

            reviewStatus: "Approved"
        };

        if (paper) query.paper = paper;

        if (year) query.year = Number(year);

        if (subject) {

            query.subjectName = {
                $regex: subject,
                $options: "i"
            };
        }

        if (topic) {

            query.topicName = {
                $regex: topic,
                $options: "i"
            };
        }

        if (difficulty) {

            query.difficulty = difficulty;
        }

        if (search) {

            query.$text = {
                $search: search
            };
        }

        const skip =
            (parseInt(page) - 1) *
            parseInt(limit);

        const questions =
            await MainsQuestion

                .find(query)

                .sort({
                    year: -1,
                    paper: 1,
                    questionNumber: 1
                })

                .skip(skip)

                .limit(parseInt(limit));

        const total =
            await MainsQuestion
                .countDocuments(query);

        // Fetch user attempts in parallel

        let attemptedIds = new Set();

        let bookmarkedIds = new Set();

        if (req.user) {

            const attempts =
                await MainsAttempt.find({

                    userId:
                        req.user._id,

                    questionId: {
                        $in:
                            questions.map(q => q._id)
                    }
                });

            attempts.forEach(a => {

                if (a.completed) {

                    attemptedIds.add(
                        a.questionId.toString()
                    );
                }

                if (a.bookmarked) {

                    bookmarkedIds.add(
                        a.questionId.toString()
                    );
                }
            });
        }

        const enriched =
            questions.map(q => ({

                ...q.toObject(),

                isCompleted:
                    attemptedIds.has(
                        q._id.toString()
                    ),

                isBookmarked:
                    bookmarkedIds.has(
                        q._id.toString()
                    )
            }));

        res.json({

            questions:
                enriched,

            total,

            page:
                parseInt(page),

            totalPages:
                Math.ceil(total / parseInt(limit))
        });

    } catch (err) {

        console.error(
            "Get Mains Questions Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// GET ONE
// =========================

exports.getQuestionById = async (
    req,
    res
) => {

    try {

        const question =
            await MainsQuestion.findById(
                req.params.id
            );

        if (!question) {

            return res.status(404).json({
                message: "Question not found"
            });
        }

        let attempt = null;

        if (req.user) {

            attempt =
                await MainsAttempt.findOne({

                    userId:
                        req.user._id,

                    questionId:
                        question._id
                });
        }

        res.json({

            question:
                question.toObject(),

            attempt:
                attempt
                    ? attempt.toObject()
                    : null
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// UPDATE (Admin)
// =========================

exports.updateQuestion = async (
    req,
    res
) => {

    try {

        const updated =
            await MainsQuestion.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true
                }
            );

        if (!updated) {

            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.json(updated);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// DELETE (Admin) — with cascade
// =========================
exports.deleteQuestion = async (
    req,
    res
) => {
    try {
        const mongoose = require("mongoose");
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ message: "Invalid question id" });
        }

        const question = await MainsQuestion.findById(id);
        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        await MainsQuestion.findByIdAndDelete(id);

        // Cascade delete attempts
        await MainsAttempt.deleteMany({
            questionId: id
        }).catch(() => null);

        res.json({
            message: "Question deleted permanently"
        });

    } catch (err) {
        console.error("Mains deleteQuestion:", err);
        res.status(500).json({
            message: err.message
        });
    }
};
// =========================
// GET FILTERS METADATA
// (For populating filter dropdowns)
// =========================
// =========================
// BULK DELETE (Admin)
// POST /api/mains/questions/bulk-delete
// body: { ids: [...] }
// =========================
exports.bulkDelete = async (
    req,
    res
) => {
    try {
        const mongoose = require("mongoose");
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
            return res
                .status(400)
                .json({ message: "No valid ids" });
        }

        const [deletedRes] = await Promise.all([
            MainsQuestion.deleteMany({
                _id: { $in: validIds }
            }),
            MainsAttempt.deleteMany({
                questionId: { $in: validIds }
            }).catch(() => null),
        ]);

        res.json({
            message: `${deletedRes.deletedCount} question(s) deleted`,
            deletedCount: deletedRes.deletedCount,
        });

    } catch (err) {
        console.error("Mains bulkDelete:", err);
        res.status(500).json({
            message: err.message
        });
    }
};

exports.getFiltersMetadata = async (
    req,
    res
) => {

    try {

        const [
            years,
            papers,
            subjects
        ] = await Promise.all([

            MainsQuestion.distinct("year"),

            MainsQuestion.distinct("paper"),

            MainsQuestion.distinct("subjectName")
        ]);

        res.json({

            years:
                years
                    .filter(Boolean)
                    .sort((a, b) => b - a),

            papers:
                papers
                    .filter(Boolean)
                    .sort(),

            subjects:
                subjects
                    .filter(Boolean)
                    .sort()
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};
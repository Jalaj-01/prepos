const Question = require("../models/Question");

// =========================
// SMART QUESTION SEARCH
// =========================

exports.searchQuestions = async (req, res) => {
    try {
        const {
            q,
            subject,
            topic,
            year,
            paper,
            repeated,
            page = 1,
            limit = 25,
        } = req.query;

        // =========================
        // BUILD FILTERS
        // =========================

        let filters = {};

        // KEYWORD SEARCH
        if (q) {
            filters.$or = [
                { questionText: { $regex: q, $options: "i" } },
                { subjectName: { $regex: q, $options: "i" } },
                { topicName: { $regex: q, $options: "i" } },
                { subtopicName: { $regex: q, $options: "i" } },
                { "aiMetadata.subject": { $regex: q, $options: "i" } },
                { "aiMetadata.topic": { $regex: q, $options: "i" } },
                { "aiMetadata.subtopic": { $regex: q, $options: "i" } },
                { tags: { $elemMatch: { $regex: q, $options: "i" } } },
            ];
        }

        // SUBJECT — match BOTH new field (subjectName) and legacy (aiMetadata)
        if (subject) {
            filters.$and = filters.$and || [];
            filters.$and.push({
                $or: [
                    { subjectName: { $regex: subject, $options: "i" } },
                    { "aiMetadata.subject": { $regex: subject, $options: "i" } },
                ],
            });
        }

        // TOPIC
        if (topic) {
            filters.$and = filters.$and || [];
            filters.$and.push({
                $or: [
                    { topicName: { $regex: topic, $options: "i" } },
                    { "aiMetadata.topic": { $regex: topic, $options: "i" } },
                ],
            });
        }

        // YEAR
        if (year) {
            filters.year = Number(year);
        }

        // PAPER
        if (paper) {
            filters.paper = paper;
        }

        // REPEATED ONLY
        if (repeated === "true") {
            filters.isRepeatedConcept = true;
        }

        // =========================
        // PAGINATION
        // =========================
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const pageLimit = Math.min(parseInt(limit) || 25, 200); // max 200/page
        const skip = (pageNum - 1) * pageLimit;

        // =========================
        // FETCH + COUNT IN PARALLEL
        // =========================
        const [questions, total] = await Promise.all([
            Question.find(filters)
                .sort({ year: -1, createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),
            Question.countDocuments(filters),
        ]);

        res.json({
            questions,
            pagination: {
                page: pageNum,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(total / pageLimit),
            },
        });
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: error.message });
    }
};
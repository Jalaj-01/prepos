const Attempt = require('../models/Attempt');
const User = require('../models/User');

exports.logAttempt = async (req, res) => {
    try {
        const { questionId, isCorrect, timeTaken, selectedOption, mistakeCategory } = req.body;
        const userId = req.user._id;

        const attempt = await Attempt.create({
            userId, questionId, isCorrect, timeTaken, selectedOption,
            mistakeCategory: mistakeCategory || 'None',
            nextRevisionDate: isCorrect ? null : new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        const user = await User.findById(userId);
        const today = new Date().setHours(0, 0, 0, 0);
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).setHours(0, 0, 0, 0) : null;

        if (lastActive !== today) {
            if (lastActive === today - 86400000) user.streak += 1;
            else user.streak = 1;
            user.lastActiveDate = new Date();
        }
        user.totalQuestionsSolved += 1;
        await user.save();

        res.status(201).json({ attempt, streak: user.streak });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date().setHours(0,0,0,0);

        const totalSolved = await Attempt.countDocuments({ userId });
        const totalSolvedToday = await Attempt.countDocuments({ 
            userId, 
            createdAt: { $gte: new Date(today) } 
        });

        res.json({ totalSolved, totalSolvedToday });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================
// GET QUESTION STATUS MAP
// Returns a map of { questionId: true } for questions the user has attempted
// POST /api/attempts/status-map   body: { questionIds: [...] }
// =========================
exports.getQuestionStatusMap = async (req, res) => {
    try {
        const { questionIds } = req.body;

        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return res.json({ attempted: {} });
        }

        // Find all attempts by this user for these questions
        const attempts = await Attempt.find({
            userId: req.user._id,
            questionId: { $in: questionIds }
        }).select('questionId').lean();

        // Build a map for fast lookup
        const attempted = {};
        attempts.forEach(a => {
            attempted[String(a.questionId)] = true;
        });

        res.json({ attempted });
    } catch (error) {
        console.error('getQuestionStatusMap:', error);
        res.status(500).json({ message: error.message });
    }
    
};

// =========================
// GET ATTEMPTED COUNT FOR A FILTER
// Returns: { total, attempted, notAttempted }
// POST /api/attempts/status-count
// body: filters object (same shape as /api/search): { year, subject, topic, paper, q, repeated }
// =========================
exports.getAttemptedCount = async (req, res) => {
    try {
        const Question = require("../models/Question");
        const { q, subject, topic, year, paper, repeated } = req.body || {};

        // Build the SAME filter as searchController
        const filters = {};

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

        if (subject) {
            filters.$and = filters.$and || [];
            filters.$and.push({
                $or: [
                    { subjectName: { $regex: subject, $options: "i" } },
                    { "aiMetadata.subject": { $regex: subject, $options: "i" } },
                ],
            });
        }

        if (topic) {
            filters.$and = filters.$and || [];
            filters.$and.push({
                $or: [
                    { topicName: { $regex: topic, $options: "i" } },
                    { "aiMetadata.topic": { $regex: topic, $options: "i" } },
                ],
            });
        }

        if (year) filters.year = Number(year);
        if (paper) filters.paper = paper;
        if (repeated === true || repeated === "true") {
            filters.isRepeatedConcept = true;
        }

        // Step 1: get IDs of ALL questions matching the filter (just _id, very fast with index)
        const matchingQuestions = await Question.find(filters)
            .select("_id")
            .lean();

        const total = matchingQuestions.length;
        const allIds = matchingQuestions.map((q) => q._id);

        // Step 2: count distinct questions this user has attempted from those
        const attempted = await Attempt.distinct("questionId", {
            userId: req.user._id,
            questionId: { $in: allIds },
        });

        const attemptedCount = attempted.length;

        // Also return the set of attempted IDs (as strings) for visible-page badges
        const attemptedIds = {};
        attempted.forEach((id) => {
            attemptedIds[String(id)] = true;
        });

        res.json({
            total,
            attempted: attemptedCount,
            notAttempted: total - attemptedCount,
            attemptedIds, // map for the frontend to use as the truth source
        });
    } catch (error) {
        console.error("getAttemptedCount:", error);
        res.status(500).json({ message: error.message });
    }
};
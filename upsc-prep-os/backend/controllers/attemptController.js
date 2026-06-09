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
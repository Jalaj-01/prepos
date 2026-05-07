const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Taxonomy = require('../models/Taxonomy');

exports.getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Mistake Distribution
        const mistakeStats = await Attempt.aggregate([
            { $match: { userId, isCorrect: false } },
            { $group: { _id: "$mistakeCategory", value: { $sum: 1 } } },
            { $sort: { value: -1 } }
        ]);

        // 2. Heatmap Data (Real activity counts)
        const heatmapData = await Attempt.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Subject-wise Accuracy (Strict population)
        const attempts = await Attempt.find({ userId }).populate({
            path: 'questionId',
            populate: { path: 'taxonomyIds' }
        });

        const subjectStats = {};
        attempts.forEach(att => {
            if (!att.questionId || !att.questionId.taxonomyIds) return;
            const subject = att.questionId.taxonomyIds.find(t => t.level === 'subject');
            if (subject) {
                if (!subjectStats[subject.name]) subjectStats[subject.name] = { name: subject.name, correct: 0, total: 0 };
                subjectStats[subject.name].total++;
                if (att.isCorrect) subjectStats[subject.name].correct++;
            }
        });

        const subjectAccuracy = Object.values(subjectStats).map(s => ({
            name: s.name,
            accuracy: Math.round((s.correct / s.total) * 100)
        }));

        // 4. Readiness Score
        const totalSolved = attempts.length;
        const totalCorrect = attempts.filter(a => a.isCorrect).length;
        const accuracy = totalSolved > 0 ? (totalCorrect / totalSolved) : 0;
        let readinessScore = totalSolved > 0 ? (accuracy * 70) + (Math.min(totalSolved / 500, 1) * 30) : 0;

        res.json({
            mistakeStats: mistakeStats.map(m => ({ name: m._id, value: m.value })),
            heatmapData,
            subjectAccuracy,
            readinessScore: Math.round(readinessScore),
            totalSolvedYear: totalSolved
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
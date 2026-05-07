const User = require('../models/User');
const Attempt = require('../models/Attempt');

exports.getLeaderboard = async (req, res) => {
    try {
        // 1. Consistency Leaderboard (Top Streaks)
        const consistencyRank = await User.find()
            .select('name streak')
            .sort({ streak: -1 })
            .limit(10);

        // 2. Accuracy Leaderboard (Calculated from Attempts)
        // We look at users who solved at least 20 questions
        const accuracyRank = await Attempt.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalSolved: { $sum: 1 },
                    correctSolved: { $sum: { $cond: ["$isCorrect", 1, 0] } }
                }
            },
            { $match: { totalSolved: { $gt: 10 } } }, // Minimum threshold
            {
                $project: {
                    accuracy: { $multiply: [{ $divide: ["$correctSolved", "$totalSolved"] }, 100] }
                }
            },
            { $sort: { accuracy: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" }
        ]);

        res.json({
            consistency: consistencyRank,
            accuracy: accuracyRank.map(a => ({
                name: a.userDetails.name,
                value: Math.round(a.accuracy)
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Taxonomy = require('../models/Taxonomy');
const PreparationTrack = require('../models/PreparationTrack');

exports.getDashboardAnalytics = async (req, res) => {

    try {

        const userId = req.user._id;

        // =========================
        // 1. MISTAKE DISTRIBUTION
        // =========================

        const mistakeStats =
            await Attempt.aggregate([

                {
                    $match: {
                        userId,
                        isCorrect: false
                    }
                },

                {
                    $group: {
                        _id: "$mistakeCategory",
                        value: { $sum: 1 }
                    }
                },

                {
                    $sort: {
                        value: -1
                    }
                }
            ]);

        // =========================
        // 2. ADVANCED HEATMAP DATA
        // =========================

        const heatmapData =
            await Attempt.aggregate([

                {
                    $match: { userId }
                },

                {
                    $group: {

                        _id: {

                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },

                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);

        // Calculate streak and consistency
        const sortedDates = heatmapData.map(h => h._id).sort();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let consistencyDays = 0;

        for (let i = 0; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = i > 0 ? new Date(sortedDates[i - 1]) : null;

            const diffDays = prevDate ? Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24)) : 0;

            if (diffDays === 1) {
                tempStreak++;
            } else if (diffDays === 0) {
                // Same day, continue streak
            } else {
                tempStreak = 1;
            }

            longestStreak = Math.max(longestStreak, tempStreak);

            // Check if today or yesterday (current streak)
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const isToday = currentDate.toDateString() === today.toDateString();
            const isYesterday = currentDate.toDateString() === yesterday.toDateString();

            if (isToday || isYesterday) {
                currentStreak = tempStreak;
            }
        }

        consistencyDays = sortedDates.length;

        // Weekly density (last 8 weeks)
        const weeklyDensity = [];
        const today = new Date();
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weekAttempts = await Attempt.countDocuments({
                userId,
                createdAt: { $gte: weekStart, $lte: weekEnd }
            });

            weeklyDensity.push({
                weekStart: weekStart.toISOString().split('T')[0],
                weekEnd: weekEnd.toISOString().split('T')[0],
                count: weekAttempts
            });
        }

        // =========================
        // 3. FETCH ATTEMPTS
        // =========================

        const attempts =
            await Attempt.find({

                userId

            }).populate({

                path: 'questionId',

                populate: {
                    path: 'taxonomyIds'
                }
            });

        // =========================
        // 4. SUBJECT ACCURACY
        // =========================

        const subjectStats = {};

        attempts.forEach(att => {

            if (
                !att.questionId ||
                !att.questionId.taxonomyIds
            ) return;

            const subject =
                att.questionId.taxonomyIds.find(
                    t => t.level === 'subject'
                );

            if (subject) {

                if (!subjectStats[subject.name]) {

                    subjectStats[subject.name] = {

                        name: subject.name,
                        correct: 0,
                        total: 0
                    };
                }

                subjectStats[subject.name].total++;

                if (att.isCorrect) {

                    subjectStats[subject.name].correct++;
                }
            }
        });

        const subjectAccuracy =
            Object.values(subjectStats)

            .map(subject => ({

                name: subject.name,

                accuracy:

                    Math.round(

                        (subject.correct / subject.total)
                        * 100
                    )
            }));

        // =========================
        // 5. WEAK TOPICS
        // =========================

        const topicStats = {};

        attempts.forEach(att => {

            if (
                !att.questionId ||
                !att.questionId.taxonomyIds
            ) return;

            const topic =
                att.questionId.taxonomyIds.find(
                    t => t.level === "topic"
                );

            if (topic) {

                if (!topicStats[topic.name]) {

                    topicStats[topic.name] = {

                        name: topic.name,
                        correct: 0,
                        total: 0,
                        totalTime: 0
                    };
                }

                topicStats[topic.name].total++;

                topicStats[topic.name].totalTime +=
                    att.timeTaken || 0;

                if (att.isCorrect) {

                    topicStats[topic.name].correct++;
                }
            }
        });

        const weakTopics =
            Object.values(topicStats)

            .map(topic => ({

                name: topic.name,

                accuracy:

                    Math.round(

                        (topic.correct / topic.total)
                        * 100
                    ),

                avgTime:

                    Math.round(

                        topic.totalTime /
                        topic.total
                    )
            }))

            .sort(
                (a, b) =>
                    a.accuracy - b.accuracy
            )

            .slice(0, 5);

        // =========================
        // 6. SMART RECOMMENDATIONS
        // =========================

        let recommendations = [];

        if (weakTopics.length > 0) {

            recommendations.push(

                `Focus more on ${weakTopics[0].name}. Accuracy is below your average.`
            );
        }

        if (mistakeStats.length > 0) {

            recommendations.push(

                `Most common mistake pattern: ${mistakeStats[0]._id}`
            );
        }

        const slowTopic =
            [...weakTopics]

            .sort(
                (a, b) =>
                    b.avgTime - a.avgTime
            )[0];

        if (slowTopic) {

            recommendations.push(

                `You spend the most time on ${slowTopic.name} questions.`
            );
        }

        // =========================
        // 7. READINESS SCORE
        // =========================

        const totalSolved =
            attempts.length;

        const totalCorrect =
            attempts.filter(
                a => a.isCorrect
            ).length;

        const accuracy =
            totalSolved > 0
                ? (totalCorrect / totalSolved)
                : 0;

        let readinessScore =
            totalSolved > 0

                ? (

                    accuracy * 70

                    +

                    (
                        Math.min(
                            totalSolved / 500,
                            1
                        ) * 30
                    )
                )

                : 0;

        // =========================
        // RESPONSE
        // =========================

        res.json({

            mistakeStats:

                mistakeStats.map(m => ({

                    name: m._id,
                    value: m.value
                })),

            heatmapData,
            streakData: {
                currentStreak,
                longestStreak,
                consistencyDays,
                weeklyDensity
            },

            subjectAccuracy,

            weakTopics,

            recommendations,

            readinessScore:

                Math.round(
                    readinessScore
                ),

            totalSolvedYear:
                totalSolved
        });

    } catch (error) {

        console.error(
            "Analytics Error:",
            error
        );

        res.status(500).json({

            message:
                error.message
        });
    }
};

const getWeakAreaIntelligenceInternal = async (userId, mode) => {
    const track = await PreparationTrack.findOne({
        userId,
        mode,
        isActive: true
    });

    if (!track) {
        return null;
    }

    let query = {};

    if (track.selectedYears?.length) {
        query.year = { $in: track.selectedYears };
    }

    if (track.selectedTopics?.length) {
        query.taxonomyIds = { $in: track.selectedTopics };
    } else if (track.selectedSubjects?.length) {
        query.taxonomyIds = { $in: track.selectedSubjects };
    }

    if (mode === 'CSAT') {
        query.paper = 'CSAT';
    } else {
        query.paper = { $ne: 'CSAT' };
    }

    const attempts = await Attempt.find({ userId }).populate({
        path: 'questionId',
        populate: { path: 'taxonomyIds' }
    });

    const subjectStats = {};
    const topicStats = {};
    const mistakePatterns = {};

    attempts.forEach(att => {
        if (!att.questionId) return;

        const subject = att.questionId.subjectName;
        const topic = att.questionId.topicName;

        if (subject) {
            if (!subjectStats[subject]) {
                subjectStats[subject] = { correct: 0, total: 0, totalTime: 0 };
            }
            subjectStats[subject].total++;
            subjectStats[subject].totalTime += att.timeTaken || 0;
            if (att.isCorrect) subjectStats[subject].correct++;
        }

        if (topic) {
            if (!topicStats[topic]) {
                topicStats[topic] = { correct: 0, total: 0, totalTime: 0 };
            }
            topicStats[topic].total++;
            topicStats[topic].totalTime += att.timeTaken || 0;
            if (att.isCorrect) topicStats[topic].correct++;
        }

        if (!att.isCorrect && att.mistakeCategory) {
            mistakePatterns[att.mistakeCategory] = (mistakePatterns[att.mistakeCategory] || 0) + 1;
        }
    });

    const weakestSubject = Object.entries(subjectStats)
        .map(([name, data]) => ({
            name,
            accuracy: Math.round((data.correct / data.total) * 100),
            avgTime: Math.round(data.totalTime / data.total),
            total: data.total
        }))
        .sort((a, b) => a.accuracy - b.accuracy)[0];

    const weakestTopic = Object.entries(topicStats)
        .map(([name, data]) => ({
            name,
            accuracy: Math.round((data.correct / data.total) * 100),
            avgTime: Math.round(data.totalTime / data.total),
            total: data.total
        }))
        .sort((a, b) => a.accuracy - b.accuracy)[0];

    const slowestSubject = Object.entries(subjectStats)
        .map(([name, data]) => ({
            name,
            avgTime: Math.round(data.totalTime / data.total),
            total: data.total
        }))
        .sort((a, b) => b.avgTime - a.avgTime)[0];

    const mostCommonMistake = Object.entries(mistakePatterns)
        .sort((a, b) => b[1] - a[1])[0];

    const wrongQuestionsCount = track.wrongQuestions.length;
    const unsolvedQuestionsCount = track.remainingQuestionIds.length;

    return {
        weakestSubject: weakestSubject || null,
        weakestTopic: weakestTopic || null,
        slowestSubject: slowestSubject || null,
        mostCommonMistake: mostCommonMistake ? { name: mostCommonMistake[0], count: mostCommonMistake[1] } : null,
        wrongQuestionsCount,
        unsolvedQuestionsCount,
        subjectRanking: Object.entries(subjectStats)
            .map(([name, data]) => ({
                name,
                accuracy: Math.round((data.correct / data.total) * 100),
                total: data.total
            }))
            .sort((a, b) => a.accuracy - b.accuracy),
        topicRanking: Object.entries(topicStats)
            .map(([name, data]) => ({
                name,
                accuracy: Math.round((data.correct / data.total) * 100),
                total: data.total
            }))
            .sort((a, b) => a.accuracy - b.accuracy)
    };
};

exports.getCompletionBreakdown = async (req, res) => {
    try {
        const userId = req.user._id;
        const mode = req.query.mode || 'GS';

        const track = await PreparationTrack.findOne({
            userId,
            mode,
            isActive: true
        });

        if (!track) {
            return res.status(404).json({
                message: 'No active preparation track found'
            });
        }

        let query = {};

        if (track.selectedYears?.length) {
            query.year = { $in: track.selectedYears };
        }

        if (track.selectedTopics?.length) {
            query.taxonomyIds = { $in: track.selectedTopics };
        } else if (track.selectedSubjects?.length) {
            query.taxonomyIds = { $in: track.selectedSubjects };
        }

        if (mode === 'CSAT') {
            query.paper = 'CSAT';
        } else {
            query.paper = { $ne: 'CSAT' };
        }

        const allQuestions = await Question.find(query).select('_id subjectName topicName');
        const solvedQuestionIds = track.solvedQuestions.map(id => id.toString());

        const subjectStats = {};
        const topicStats = {};

        allQuestions.forEach(question => {
            if (question.subjectName) {
                if (!subjectStats[question.subjectName]) {
                    subjectStats[question.subjectName] = {
                        name: question.subjectName,
                        total: 0,
                        solved: 0
                    };
                }
                subjectStats[question.subjectName].total++;
                if (solvedQuestionIds.includes(question._id.toString())) {
                    subjectStats[question.subjectName].solved++;
                }
            }

            if (question.topicName) {
                if (!topicStats[question.topicName]) {
                    topicStats[question.topicName] = {
                        name: question.topicName,
                        total: 0,
                        solved: 0
                    };
                }
                topicStats[question.topicName].total++;
                if (solvedQuestionIds.includes(question._id.toString())) {
                    topicStats[question.topicName].solved++;
                }
            }
        });

        const subjects = Object.values(subjectStats).map(subject => ({
            name: subject.name,
            solved: subject.solved,
            total: subject.total,
            percentage: subject.total > 0 ? Math.round((subject.solved / subject.total) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);

        const topics = Object.values(topicStats).map(topic => ({
            name: topic.name,
            solved: topic.solved,
            total: topic.total,
            percentage: topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);

        res.json({
            subjects,
            topics
        });

    } catch (error) {
        console.error('Completion Breakdown Error:', error);
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getWeakAreaIntelligence = async (req, res) => {
    try {
        const userId = req.user._id;
        const mode = req.query.mode || 'GS';

        const data = await getWeakAreaIntelligenceInternal(userId, mode);

        if (!data) {
            return res.status(404).json({
                message: 'No active preparation track found'
            });
        }

        res.json(data);

    } catch (error) {
        console.error('Weak Area Intelligence Error:', error);
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getSmartRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const mode = req.query.mode || 'GS';

        const track = await PreparationTrack.findOne({
            userId,
            mode,
            isActive: true
        });

        if (!track) {
            return res.status(404).json({
                message: 'No active preparation track found'
            });
        }

        const recommendations = [];

        if (track.wrongQuestions.length > 0) {
            recommendations.push({
                type: 'revision',
                priority: 'high',
                title: 'Revision Needed',
                description: `${track.wrongQuestions.length} questions need revision. Focus on these to improve retention.`,
                action: 'Start Sunday Revision',
                actionUrl: '/revision'
            });
        }

        if (track.remainingQuestionIds.length > 0) {
            const completionPercentage = Math.round(((track.totalQuestions - track.remainingQuestionIds.length) / track.totalQuestions) * 100);

            if (completionPercentage < 50) {
                recommendations.push({
                    type: 'progress',
                    priority: 'medium',
                    title: 'Boost Your Progress',
                    description: `You've completed ${completionPercentage}% of your track. Increase daily practice to stay on target.`,
                    action: 'Continue Practice',
                    actionUrl: `/practice?mode=${mode}`
                });
            }
        }

        const weakAreas = await getWeakAreaIntelligenceInternal(userId, mode);

        if (weakAreas.weakestSubject && weakAreas.weakestSubject.accuracy < 50) {
            recommendations.push({
                type: 'focus',
                priority: 'high',
                title: `Focus: ${weakAreas.weakestSubject.name}`,
                description: `Your accuracy in ${weakAreas.weakestSubject.name} is ${weakAreas.weakestSubject.accuracy}%. This needs immediate attention.`,
                action: 'Practice This Subject',
                actionUrl: `/practice?mode=${mode}`
            });
        }

        if (weakAreas.weakestTopic && weakAreas.weakestTopic.accuracy < 50) {
            recommendations.push({
                type: 'focus',
                priority: 'high',
                title: `Weak Topic: ${weakAreas.weakestTopic.name}`,
                description: `${weakAreas.weakestTopic.name} has ${weakAreas.weakestTopic.accuracy}% accuracy. Dedicate extra time here.`,
                action: 'Practice This Topic',
                actionUrl: `/practice?mode=${mode}`
            });
        }

        if (weakAreas.slowestSubject && weakAreas.slowestSubject.avgTime > 120) {
            recommendations.push({
                type: 'speed',
                priority: 'medium',
                title: 'Speed Up: ' + weakAreas.slowestSubject.name,
                description: `You spend ${Math.round(weakAreas.slowestSubject.avgTime / 60)} minutes per question in ${weakAreas.slowestSubject.name}. Practice for speed.`,
                action: 'Timed Practice',
                actionUrl: `/practice?mode=${mode}`
            });
        }

        res.json({
            recommendations: recommendations.slice(0, 5)
        });

    } catch (error) {
        console.error('Smart Recommendations Error:', error);
        res.status(500).json({
            message: error.message
        });
    }
};
const Attempt = require('../models/Attempt');
const PreparationTrack = require('../models/PreparationTrack');
const Question = require('../models/Question');

// Get all questions due for revision today
exports.getDueRevisions = async (req, res) => {
    try {
        const today = new Date();
        const userId = req.user._id;

        // Find attempts where nextRevisionDate is today or past, and not yet mastered
        const dueAttempts = await Attempt.find({
            userId,
            nextRevisionDate: { $lte: today },
            isCorrect: false // We revise what we got wrong
        }).populate('questionId');

        res.json(dueAttempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update the revision stage after a revision attempt
exports.processRevisionResult = async (req, res) => {
    try {
        const { attemptId, isCorrectNow } = req.body;
        const attempt = await Attempt.findById(attemptId);

        if (!attempt) return res.status(404).json({ message: "Attempt record not found" });

        // Spaced Repetition Intervals (in days)
        const intervals = [1, 3, 7, 21, 60];

        if (isCorrectNow) {
            // Move to next stage
            attempt.revisionStage = (attempt.revisionStage || 0) + 1;
            const daysToAdd = intervals[attempt.revisionStage] || 60;
            attempt.nextRevisionDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

            // If they reach the last stage, mark as mastered (optional logic)
            if (attempt.revisionStage >= 4) attempt.nextRevisionDate = null;
        } else {
            // Reset to Stage 0 (try again tomorrow)
            attempt.revisionStage = 0;
            attempt.nextRevisionDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        }

        await attempt.save();
        res.json({ message: "Revision cycle updated", nextDate: attempt.nextRevisionDate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get revision statistics and dashboard data
exports.getRevisionDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const mode = req.query.mode || 'GS';

        const track = await PreparationTrack.findOne({
            userId,
            mode,
            isActive: true
        });

        if (!track) {
            return res.status(404).json({ message: 'No active preparation track found' });
        }

        const wrongQuestions = track.wrongQuestions;
        const wrongQuestionIds = wrongQuestions.map(wq => wq.questionId);

        const wrongQuestionsData = await Question.find({
            _id: { $in: wrongQuestionIds }
        }).select('_id subjectName topicName year questionText');

        const subjectBreakdown = {};
        const topicBreakdown = {};

        wrongQuestionsData.forEach(q => {
            if (q.subjectName) {
                subjectBreakdown[q.subjectName] = (subjectBreakdown[q.subjectName] || 0) + 1;
            }
            if (q.topicName) {
                topicBreakdown[q.topicName] = (topicBreakdown[q.topicName] || 0) + 1;
            }
        });

        const today = new Date();
        const isSunday = today.getDay() === 0;

        const dueRevisions = await Attempt.countDocuments({
            userId,
            nextRevisionDate: { $lte: today },
            isCorrect: false
        });

        const masteredRevisions = await Attempt.countDocuments({
            userId,
            nextRevisionDate: null,
            isCorrect: false
        });

        res.json({
            totalWrongQuestions: wrongQuestions.length,
            dueForRevision: dueRevisions,
            masteredCount: masteredRevisions,
            isSundayRevisionDay: isSunday,
            subjectBreakdown: Object.entries(subjectBreakdown).map(([name, count]) => ({ name, count })),
            topicBreakdown: Object.entries(topicBreakdown).map(([name, count]) => ({ name, count })),
            recentWrongQuestions: wrongQuestions.slice(-5).map(wq => ({
                questionId: wq.questionId,
                wrongCount: wq.wrongCount,
                wrongDate: wq.wrongDate
            }))
        });

    } catch (error) {
        console.error('Revision Dashboard Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get revision queue for practice
exports.getRevisionQueue = async (req, res) => {
    try {
        const userId = req.user._id;
        const mode = req.query.mode || 'GS';
        const limit = parseInt(req.query.limit) || 10;

        const track = await PreparationTrack.findOne({
            userId,
            mode,
            isActive: true
        });

        if (!track) {
            return res.status(404).json({ message: 'No active preparation track found' });
        }

        const sortedWrongQuestions = [...track.wrongQuestions]
            .sort((a, b) => b.wrongCount - a.wrongCount)
            .slice(0, limit);

        const revisionQuestionIds = sortedWrongQuestions.map(wq => wq.questionId);

        const revisionQuestions = await Question.find({
            _id: { $in: revisionQuestionIds }
        }).sort({ year: -1 });

        res.json({
            questions: revisionQuestions,
            totalInQueue: track.wrongQuestions.length,
            inThisBatch: revisionQuestions.length
        });

    } catch (error) {
        console.error('Revision Queue Error:', error);
        res.status(500).json({ message: error.message });
    }
};
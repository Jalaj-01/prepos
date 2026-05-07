const Attempt = require('../models/Attempt');

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
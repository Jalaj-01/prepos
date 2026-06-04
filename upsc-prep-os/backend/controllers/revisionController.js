const PreparationTrack = require("../models/PreparationTrack");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");

const {
    calculateNextRevision,
    getDueQuestions,
    getStageBreakdown,
    getNextDueInfo,
    getUpcomingCount
} = require("../utils/revisionLogic");

// =========================
// HELPERS
// =========================

const getActiveTrack = async (userId, mode) => {

    return await PreparationTrack.findOne({
        userId,
        mode,
        isActive: true
    });
};

// =========================
// GET DUE REVISIONS
// Returns batch of questions due today for revision
//
// Query: ?mode=GS&limit=20
// =========================

exports.getDueRevisions = async (req, res) => {

    try {

        const userId = req.user._id;
        const mode   = req.query.mode || "GS";
        const limit  = parseInt(req.query.limit) || 20;

        const track = await getActiveTrack(userId, mode);

        if (!track) {
            return res.status(404).json({
                status: "no_track",
                message: "No active preparation track found. Create one to start practicing."
            });
        }

        // =========================
        // GET DUE FROM TRACK
        // =========================

        const { dueNow, totalDue, hasMore } =
            getDueQuestions(track.wrongQuestions, limit);

        if (dueNow.length === 0) {

            const nextDueInfo = getNextDueInfo(track.wrongQuestions);
            const breakdown   = getStageBreakdown(track.wrongQuestions);

            return res.json({
                status:    "caught_up",
                message:   "All caught up! No revisions due today.",
                questions: [],
                totalDue:  0,
                hasMore:   false,
                nextDue:   nextDueInfo,
                mastered:  breakdown.mastered
            });
        }

        // =========================
        // FETCH FULL QUESTION DATA
        // =========================

        const questionIds = dueNow.map(wq => wq.questionId);

        const questions =
            await Question.find({ _id: { $in: questionIds } });

        // =========================
        // ATTACH REVISION META TO EACH QUESTION
        // (so frontend knows current stage, wrongCount etc.)
        // =========================

        const wrongMap = new Map(
            track.wrongQuestions.map(wq => [wq.questionId.toString(), wq])
        );

        // Preserve due-order (oldest first)
        const orderedQuestions = dueNow
            .map(due => {
                const q = questions.find(
                    qq => qq._id.toString() === due.questionId.toString()
                );
                if (!q) return null;

                const meta = wrongMap.get(due.questionId.toString());

                return {
                    ...q.toObject(),
                    revisionMeta: {
                        currentStage:     meta.revisionStage || 0,
                        wrongCount:       meta.wrongCount,
                        lastRevisedAt:    meta.lastRevisedAt,
                        nextRevisionDate: meta.nextRevisionDate
                    }
                };
            })
            .filter(Boolean);

        return res.json({
            status:    "ready",
            mode,
            questions: orderedQuestions,
            totalDue,
            fetched:   orderedQuestions.length,
            hasMore
        });

    } catch (error) {

        console.error("Get Due Revisions Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// PROCESS REVISION ANSWER
// Updates stage / resets / masters the question
//
// Body: { questionId, isCorrect, mode, timeTaken, selectedOption, mistakeCategory }
// =========================

exports.processRevision = async (req, res) => {

    try {

        const userId = req.user._id;

        const {
            questionId,
            isCorrect,
            mode = "GS",
            timeTaken = 0,
            selectedOption = "",
            mistakeCategory = "None"
        } = req.body;

        if (!questionId) {
            return res.status(400).json({
                message: "questionId is required"
            });
        }

        const track = await getActiveTrack(userId, mode);

        if (!track) {
            return res.status(404).json({
                message: "No active preparation track found"
            });
        }

        // =========================
        // FIND THE WRONG QUESTION ENTRY
        // =========================

        const wrongEntry = track.wrongQuestions.find(
            wq => wq.questionId.toString() === questionId.toString()
        );

        if (!wrongEntry) {
            return res.status(404).json({
                message: "This question is not in your revision queue"
            });
        }

        // =========================
        // CALCULATE NEXT STATE
        // =========================

        const result = calculateNextRevision(
            wrongEntry.revisionStage,
            isCorrect
        );

        // =========================
        // UPDATE TRACK
        // =========================

        wrongEntry.revisionStage     = result.newStage;
        wrongEntry.nextRevisionDate  = result.nextRevisionDate;
        wrongEntry.mastered          = result.mastered;
        wrongEntry.lastRevisedAt     = new Date();

        if (!isCorrect) {
            wrongEntry.wrongCount += 1;
            wrongEntry.wrongDate   = new Date();
        }

        await track.save();

        // =========================
        // LOG TO ATTEMPT (for analytics)
        // =========================

        try {
            await Attempt.create({
                userId,
                questionId,
                isCorrect,
                selectedOption,
                timeTaken,
                mistakeCategory: isCorrect ? "None" : mistakeCategory,
                nextRevisionDate: result.nextRevisionDate
            });
        } catch (logErr) {
            // Don't fail the request if logging fails
            console.error("Attempt Log Error (non-fatal):", logErr.message);
        }

        // =========================
        // RESPONSE
        // =========================

        const breakdown = getStageBreakdown(track.wrongQuestions);

        return res.json({
            success: true,
            action:           result.action,        // "advanced" | "reset" | "mastered"
            newStage:         result.newStage,
            nextRevisionDate: result.nextRevisionDate,
            mastered:         result.mastered,
            stageBreakdown:   breakdown
        });

    } catch (error) {

        console.error("Process Revision Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// REVISION SUMMARY
// Full data for revision page header
//
// Query: ?mode=GS
// =========================

exports.getRevisionSummary = async (req, res) => {

    try {

        const userId = req.user._id;
        const mode   = req.query.mode || "GS";

        const track = await getActiveTrack(userId, mode);

        if (!track) {
            return res.status(404).json({
                status: "no_track",
                message: "No active preparation track found"
            });
        }

        const { totalDue, hasMore } =
            getDueQuestions(track.wrongQuestions, 20);

        const breakdown   = getStageBreakdown(track.wrongQuestions);
        const nextDueInfo = getNextDueInfo(track.wrongQuestions);
        const upcoming7   = getUpcomingCount(track.wrongQuestions, 7);

        return res.json({
            mode,
            dueToday:        Math.min(totalDue, 20),
            totalDue,
            hasMore,
            upcoming7Days:   upcoming7,
            stageBreakdown:  breakdown,
            nextDue:         nextDueInfo,
            totalInQueue:    track.wrongQuestions.length,
            masteredCount:   breakdown.mastered
        });

    } catch (error) {

        console.error("Revision Summary Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// REVISION WIDGET
// Tiny payload for dashboard widget
//
// Query: ?mode=GS
// =========================

exports.getRevisionWidget = async (req, res) => {

    try {

        const userId = req.user._id;
        const mode   = req.query.mode || "GS";

        const track = await getActiveTrack(userId, mode);

        if (!track) {
            return res.json({
                dueToday:      0,
                upcoming7Days: 0,
                mastered:      0,
                totalInQueue:  0,
                hasTrack:      false
            });
        }

        const { totalDue } = getDueQuestions(track.wrongQuestions, 999);
        const breakdown    = getStageBreakdown(track.wrongQuestions);
        const upcoming7    = getUpcomingCount(track.wrongQuestions, 7);

        return res.json({
            dueToday:      totalDue,
            upcoming7Days: upcoming7,
            mastered:      breakdown.mastered,
            totalInQueue:  track.wrongQuestions.length,
            hasTrack:      true
        });

    } catch (error) {

        console.error("Revision Widget Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};
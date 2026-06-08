const PreparationTrack =
    require("../models/PreparationTrack");

const Question =
    require("../models/Question");

// =========================
// HELPERS
// =========================

const getDateKey = (date = new Date()) => {

    return date.toISOString().split("T")[0];
};

const getOrCreateTodaySession = (track) => {

    const dateKey = getDateKey();

    let session =
        track.dailySessions.find(
            s => s.dateKey === dateKey
        );

    if (!session) {

        track.dailySessions.push({
            dateKey,
            attempted: 0,
            correct: 0,
            wrong: 0,
            totalTimeTaken: 0,
            questionIds: [],
            subjectStats: {},
            topicStats: {}
        });

        session =
            track.dailySessions[
                track.dailySessions.length - 1
            ];
    }

    return session;
};

const buildTrackQuery = (track) => {

    let query = {

        _id: {
            $nin: track.solvedQuestions
        }
    };

    if (track.selectedYears?.length) {

        query.year = {
            $in: track.selectedYears
        };
    }

    if (track.selectedTopics?.length) {

        query.taxonomyIds = {
            $in: track.selectedTopics
        };

    } else if (track.selectedSubjects?.length) {

        query.taxonomyIds = {
            $in: track.selectedSubjects
        };
    }

    if (track.mode === "CSAT") {

        query.paper = "CSAT";

    } else {

        query.paper = {
            $ne: "CSAT"
        };
    }

    return query;
};

// =========================
// CREATE TRACK
// =========================

exports.createTrack =
async (
    req,
    res
) => {

    try {

        const {
            title,
            mode,
            selectedYears,
            selectedSubjects,
            selectedTopics,
            dailyQuestionTarget
        } = req.body;

        let query = {};

        if (selectedYears?.length) {
            query.year = { $in: selectedYears };
        }

        if (selectedTopics?.length) {
            query.taxonomyIds = { $in: selectedTopics };
        } else if (selectedSubjects?.length) {
            query.taxonomyIds = { $in: selectedSubjects };
        }

        if (mode === "CSAT") {
            query.paper = "CSAT";
        } else {
            query.paper = { $ne: "CSAT" };
        }

        await PreparationTrack.updateMany(
            {
                userId: req.user._id,
                mode,
                isActive: true
            },
            {
                isActive: false
            }
        );

        const totalQuestions =
            await Question.countDocuments(query);

        const remainingQuestions =
            await Question.find(query)
                .sort({
                    year: -1,
                    createdAt: 1
                })
                .select("_id");

        const track =
            await PreparationTrack.create({

                userId: req.user._id,

                title,

                mode,

                selectedYears,

                selectedSubjects,

                selectedTopics,

                dailyQuestionTarget,

                totalQuestions,

                remainingQuestionIds:
                    remainingQuestions.map(q => q._id),

                dailySessions: []
            });

        res.status(201).json(track);

    } catch (error) {

        console.error("Create Track Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// GET MY TRACKS
// =========================

exports.getMyTrack =
async (
    req,
    res
) => {

    try {

        const tracks =
            await PreparationTrack.find({
                userId: req.user._id,
                isActive: true
            });

        const gsTrack =
            tracks.find(t => t.mode === "GS");

        const csatTrack =
            tracks.find(t => t.mode === "CSAT");

        res.json({
            gsTrack: gsTrack || null,
            csatTrack: csatTrack || null
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// GET NEXT QUESTION
// =========================

exports.getNextQuestion =
async (
    req,
    res
) => {

    try {

        const mode =
            req.query.mode || "GS";

        const track =
            await PreparationTrack.findOne({
                userId: req.user._id,
                mode,
                isActive: true
            });

        if (!track) {

            return res.status(404).json({
                message: "No active preparation track found"
            });
        }

        const todaySession =
            getOrCreateTodaySession(track);

        // =========================
        // DAILY TARGET CHECK
        // =========================

        if (
            todaySession.attempted >=
            track.dailyQuestionTarget
        ) {

            if (!todaySession.completedAt) {
                todaySession.completedAt = new Date();
                await track.save();
            }

            return res.json({

                status: "daily_complete",

                completed: true,

                message:
                    "Today's target completed",

                dailySession: todaySession,

                progress: {
                    solved: track.solvedQuestions.length,
                    remaining: track.remainingQuestionIds.length,
                    total: track.totalQuestions
                }
            });
        }

        // =========================
        // REBUILD QUEUE IF EMPTY
        // =========================

        if (
            !track.remainingQuestionIds ||
            track.remainingQuestionIds.length === 0
        ) {

            const query =
                buildTrackQuery(track);

            const remainingQuestions =
                await Question.find(query)
                    .sort({
                        year: -1,
                        createdAt: 1
                    })
                    .select("_id");

            track.remainingQuestionIds =
                remainingQuestions.map(q => q._id);

            await track.save();
        }

        // =========================
        // NO QUESTIONS MATCH FILTER
        // =========================

        if (
            track.totalQuestions === 0
        ) {

            return res.json({

                status: "no_questions",

                completed: true,

                message:
                    "No questions match your selected filters. Please create a new track with different years, subjects, or topics.",

                dailySession: todaySession,

                progress: {
                    solved: 0,
                    remaining: 0,
                    total: 0
                }
            });
        }

        // =========================
        // POOL EXHAUSTED
        // =========================

        if (
            track.remainingQuestionIds.length === 0
        ) {

            return res.json({

                status: "pool_exhausted",

                completed: true,

                message:
                    "You have completed all questions in this preparation track.",

                dailySession: todaySession,

                progress: {
                    solved: track.solvedQuestions.length,
                    remaining: 0,
                    total: track.totalQuestions
                }
            });
        }

        // =========================
        // FETCH NEXT QUESTION
        // =========================

        const nextQuestionId =
            track.remainingQuestionIds[0];

        const question =
            await Question.findById(
                nextQuestionId
            );

        // If question deleted, remove from queue and retry

        if (!question) {

            track.remainingQuestionIds =
                track.remainingQuestionIds.slice(1);

            await track.save();

            return exports.getNextQuestion(req, res);
        }

        track.lastSessionAt = new Date();

        await track.save();

        return res.json({

            status: "continue",

            completed: false,

            mode: track.mode,

            dailySession: todaySession,

            progress: {
                solved: track.solvedQuestions.length,
                remaining: track.remainingQuestionIds.length,
                total: track.totalQuestions,
                dailyAttempted: todaySession.attempted,
                dailyTarget: track.dailyQuestionTarget
            },

            question
        });

    } catch (error) {

        console.error("Next Question Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// SUBMIT ANSWER
// =========================

exports.submitAnswer =
async (
    req,
    res
) => {

    try {

        const {
            questionId,
            isCorrect,
            subjectName,
            topicName,
            timeTaken
        } = req.body;

        const mode =
            req.body.mode || "GS";

        const track =
            await PreparationTrack.findOne({
                userId: req.user._id,
                mode,
                isActive: true
            });

        if (!track) {

            return res.status(404).json({
                message: "No active track found"
            });
        }

        const todaySession =
            getOrCreateTodaySession(track);

        // Prevent duplicate same-day submission for same question

        const alreadyAttemptedToday =
            todaySession.questionIds.some(
                id => id.toString() === questionId.toString()
            );

        if (alreadyAttemptedToday) {

            return res.json({
                success: true,
                duplicate: true,
                message: "Question already attempted today",
                dailySession: todaySession
            });
        }

        // =========================
        // REMOVE FROM REMAINING
        // Always remove after attempt.
        // Wrong questions go to revision queue.
        // =========================

        track.remainingQuestionIds =
            track.remainingQuestionIds.filter(
                id => id.toString() !== questionId.toString()
            );

        // =========================
        // SOLVED QUESTIONS
        // =========================

        const alreadySolved =
            track.solvedQuestions.some(
                id => id.toString() === questionId.toString()
            );

        if (!alreadySolved) {

            track.solvedQuestions.push(questionId);
        }

        // =========================
        // WRONG QUESTIONS / REVISION QUEUE
        // =========================

        if (!isCorrect) {

            const existingWrong =
                track.wrongQuestions.find(
                    q => q.questionId.toString() === questionId.toString()
                );

            const nextRevisionDate =
                new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

            if (existingWrong) {

                existingWrong.wrongCount += 1;
                existingWrong.wrongDate = new Date();
                existingWrong.nextRevisionDate = nextRevisionDate;
                existingWrong.mastered = false;

            } else {

                track.wrongQuestions.push({
                    questionId,
                    wrongCount: 1,
                    wrongDate: new Date(),
                    revisionStage: 0,
                    nextRevisionDate,
                    mastered: false
                });
            }
        }

        // =========================
        // SUBJECT PROGRESS
        // =========================

        if (subjectName) {

            const currentCount =
                track.subjectProgress.get(subjectName) || 0;

            track.subjectProgress.set(
                subjectName,
                currentCount + 1
            );
        }

        // =========================
        // TOPIC PROGRESS
        // =========================

        if (topicName) {

            const currentCount =
                track.topicProgress.get(topicName) || 0;

            track.topicProgress.set(
                topicName,
                currentCount + 1
            );
        }

        // =========================
        // DAILY SESSION UPDATE
        // =========================

        todaySession.attempted += 1;

        todaySession.questionIds.push(questionId);

        todaySession.totalTimeTaken += timeTaken || 0;

        if (isCorrect) {
            todaySession.correct += 1;
        } else {
            todaySession.wrong += 1;
        }

        if (subjectName) {

            const s =
                todaySession.subjectStats.get(subjectName) ||
                { attempted: 0, correct: 0, wrong: 0 };

            s.attempted += 1;

            if (isCorrect) s.correct += 1;
            else s.wrong += 1;

            todaySession.subjectStats.set(subjectName, s);
        }

        if (topicName) {

            const t =
                todaySession.topicStats.get(topicName) ||
                { attempted: 0, correct: 0, wrong: 0 };

            t.attempted += 1;

            if (isCorrect) t.correct += 1;
            else t.wrong += 1;

            todaySession.topicStats.set(topicName, t);
        }

        if (
            todaySession.attempted >=
            track.dailyQuestionTarget
        ) {

            todaySession.completedAt = new Date();
        }

        track.sessionCount += 1;

        track.currentQuestionIndex += 1;

        await track.save();

        res.json({

            success: true,

            remaining: track.remainingQuestionIds.length,

            solved: track.solvedQuestions.length,

            dailySession: todaySession,

            dailyComplete:
                todaySession.attempted >=
                track.dailyQuestionTarget
        });

    } catch (error) {

        console.error("Submit Answer Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// GET TODAY QUESTIONS
// Kept for backward compatibility
// =========================

exports.getTodayQuestions =
async (
    req,
    res
) => {

    try {

        return exports.getNextQuestion(req, res);

    } catch (error) {

        console.error("Today Questions Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};
// =========================
// FREE PRACTICE (No track needed)
// =========================

exports.getFreePracticeQuestions = async (
    req,
    res
) => {

    try {

        const {
            year,
            subject,
            topic,
            paper,
            limit = 10
        } = req.query;

        const query = {};

        if (year) {
            query.year = parseInt(year);
        }

       if (subject) {
        query.subjectName = subject;
        }

        if (topic) {
            query.topicName = topic;
        }

        if (paper) {
            query.paper = paper;
        } else {
            query.paper = { $ne: "CSAT" };
        }

        // Get random questions using aggregation

        const questions = await Question.aggregate([

            { $match: query },

            { $sample: { size: parseInt(limit) } }
        ]);

        if (questions.length === 0) {

            return res.json({
                status: "no_questions",
                questions: [],
                message: "No questions match your filters"
            });
        }

        res.json({
            status: "ready",
            questions,
            total: questions.length,
            filters: { year, subject, topic, paper }
        });

    } catch (error) {

        console.error("Free Practice Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};
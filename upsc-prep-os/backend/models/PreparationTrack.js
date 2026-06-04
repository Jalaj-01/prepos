const mongoose =
    require("mongoose");

const WrongQuestionSchema =
    new mongoose.Schema({

        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
        },

        wrongCount: {
            type: Number,
            default: 1
        },

        wrongDate: {
            type: Date,
            default: Date.now
        },

        lastRevisedAt: {
            type: Date,
            default: null
        },

        revisionStage: {
            type: Number,
            default: 0
        },

        nextRevisionDate: {
            type: Date,
            default: null
        },

        mastered: {
            type: Boolean,
            default: false
        }

    }, {
        _id: false
    });

// =========================
// DAILY SESSION SCHEMA
// =========================

const DailySessionSchema =
    new mongoose.Schema({

        dateKey: {
            type: String,
            required: true
        },

        attempted: {
            type: Number,
            default: 0
        },

        correct: {
            type: Number,
            default: 0
        },

        wrong: {
            type: Number,
            default: 0
        },

        totalTimeTaken: {
            type: Number,
            default: 0
        },

        questionIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
        ],

        subjectStats: {
            type: Map,
            of: new mongoose.Schema({
                attempted: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                wrong: { type: Number, default: 0 }
            }, { _id: false }),
            default: {}
        },

        topicStats: {
            type: Map,
            of: new mongoose.Schema({
                attempted: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                wrong: { type: Number, default: 0 }
            }, { _id: false }),
            default: {}
        },

        completedAt: {
            type: Date,
            default: null
        }

    }, {
        _id: false
    });

const PreparationTrackSchema =
    new mongoose.Schema({

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true
        },

        mode: {
            type: String,
            enum: ["GS", "CSAT"],
            default: "GS"
        },

        selectedYears: [Number],

        selectedSubjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Taxonomy"
            }
        ],

        selectedTopics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Taxonomy"
            }
        ],

        dailyQuestionTarget: {
            type: Number,
            default: 10
        },

        totalQuestions: {
            type: Number,
            default: 0
        },

        currentQuestionIndex: {
            type: Number,
            default: 0
        },

        sessionCount: {
            type: Number,
            default: 0
        },

        lastSessionAt: {
            type: Date,
            default: null
        },

        remainingQuestionIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
        ],

        solvedQuestions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
        ],

        wrongQuestions: [
            WrongQuestionSchema
        ],

        completedPools: [
            {
                type: String
            }
        ],

        subjectProgress: {
            type: Map,
            of: Number,
            default: {}
        },

        topicProgress: {
            type: Map,
            of: Number,
            default: {}
        },

        revisionDay: {
            type: Number,
            default: 7
        },

        // =========================
        // NEW DAILY SESSION TRACKING
        // =========================

        dailySessions: [
            DailySessionSchema
        ],

        isActive: {
            type: Boolean,
            default: true
        }

    }, {
        timestamps: true
    });

PreparationTrackSchema.index({
    userId: 1,
    mode: 1,
    isActive: 1
});

PreparationTrackSchema.index({
    userId: 1,
    "dailySessions.dateKey": 1
});

module.exports =
    mongoose.model(
        "PreparationTrack",
        PreparationTrackSchema
    );
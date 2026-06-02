const mongoose =
    require("mongoose");

const WrongQuestionSchema =
    new mongoose.Schema({

        questionId: {

            type:
                mongoose.Schema.Types.ObjectId,

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
        }

    }, {

        _id: false
    });

const PreparationTrackSchema =
    new mongoose.Schema({

        // =========================
        // USER
        // =========================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true
        },

        // =========================
        // TRACK INFO
        // =========================

        title: {

            type: String,

            required: true
        },

        mode: {

            type: String,

            enum: [

                "GS",
                "CSAT"
            ],

            default: "GS"
        },

        // =========================
        // FILTERS
        // =========================

        selectedYears: [

            Number
        ],

        selectedSubjects: [

            {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Taxonomy"
            }
        ],

        selectedTopics: [

            {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Taxonomy"
            }
        ],

        // =========================
        // TARGETS
        // =========================

        dailyQuestionTarget: {

            type: Number,

            default: 10
        },

        totalQuestions: {

            type: Number,

            default: 0
        },

        // =========================
        // CONTINUITY ENGINE
        // =========================

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
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Question"
            }
        ],

        // =========================
        // PERFORMANCE
        // =========================

        solvedQuestions: [

            {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Question"
            }
        ],

        wrongQuestions: [

            WrongQuestionSchema
        ],

        // =========================
        // COMPLETION
        // =========================

        completedPools: [

            {
                type: String
            }
        ],

        // =========================
        // ANALYTICS
        // =========================

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

        // =========================
        // REVISION
        // =========================

        revisionDay: {

            type: Number,

            default: 7
        },

        // =========================
        // STATUS
        // =========================

        isActive: {

            type: Boolean,

            default: true
        }

    }, {

        timestamps: true
    });

module.exports =
    mongoose.model(
        "PreparationTrack",
        PreparationTrackSchema
    );
const mongoose = require("mongoose");

// =========================
// MAINS ATTEMPT
// (Simple Done/Not-Done — NO Revision)
// =========================

const MainsAttemptSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainsQuestion',
        required: true
    },

    completed: {
        type: Boolean,
        default: true
    },

    completedAt: {
        type: Date,
        default: Date.now
    },

    // =========================
    // ANSWER WRITING (Future)
    // =========================

    answerText: {
        type: String,
        default: ""
    },

    wordCount: {
        type: Number,
        default: 0
    },

    timeTakenSeconds: {
        type: Number,
        default: 0
    },

    // =========================
    // USER NOTES
    // =========================

    notes: {
        type: String,
        default: ""
    },

    // =========================
    // SELF-RATING (Future)
    // =========================

    selfRating: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },

    bookmarked: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// =========================
// COMPOUND UNIQUE INDEX
// =========================

MainsAttemptSchema.index(
    {
        userId: 1,
        questionId: 1
    },
    {
        unique: true
    }
);

MainsAttemptSchema.index({ userId: 1, completedAt: -1 });
MainsAttemptSchema.index({ userId: 1, bookmarked: 1 });

module.exports =
    mongoose.model(
        'MainsAttempt',
        MainsAttemptSchema
    );
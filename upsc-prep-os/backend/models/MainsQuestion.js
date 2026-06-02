const mongoose = require("mongoose");

// =========================
// MAINS QUESTION SCHEMA
// (Separate from Prelims)
// =========================

const MainsQuestionSchema = new mongoose.Schema({

    // =========================
    // CORE QUESTION
    // =========================

    questionText: {
        type: String,
        required: true
    },

    // =========================
    // PAPER & METADATA
    // =========================

    paper: {
        type: String,
        enum: [
            'GS1',
            'GS2',
            'GS3',
            'GS4',
            'Essay',
            'Optional'
        ],
        required: true
    },

    year: {
        type: Number,
        required: true
    },

    marks: {
        type: Number,
        default: 10
    },

    wordLimit: {
        type: Number,
        default: 150
    },

    questionNumber: {
        type: Number,
        default: null
    },

    // =========================
    // CATEGORIZATION
    // =========================

    subjectName: {
        type: String,
        default: ''
    },

    topicName: {
        type: String,
        default: ''
    },

    subtopicName: {
        type: String,
        default: ''
    },

    keywords: [{
        type: String
    }],

    taxonomyIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Taxonomy'
    }],

    tags: [String],

    // =========================
    // OPTIONAL PAPER ONLY
    // =========================

    optionalSubject: {
        type: String,
        default: null
    },

    // =========================
    // MODEL ANSWER (Optional)
    // =========================

    modelAnswer: {
        type: String,
        default: ""
    },

    answerKeyPoints: [{
        type: String
    }],

    referenceLinks: [{
        title: String,
        url: String
    }],

    // =========================
    // DIFFICULTY
    // =========================

    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },

    // =========================
    // SOURCE
    // =========================

    source: {
        type: {
            type: String,
            enum: [
                'UPSC PYQ',
                'Test Series',
                'Mock Test',
                'Custom'
            ],
            default: 'UPSC PYQ'
        },
        sourceName: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // =========================
    // REVIEW WORKFLOW
    // =========================

    reviewStatus: {
        type: String,
        enum: [
            'Pending',
            'Reviewed',
            'Approved',
            'Rejected'
        ],
        default: 'Approved'
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    reviewedAt: Date,

    // =========================
    // DEDUPLICATION
    // =========================

    normalizedQuestionHash: {
        type: String,
        index: true
    },

    isRepeated: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// =========================
// INDEXES
// =========================

MainsQuestionSchema.index({ paper: 1 });
MainsQuestionSchema.index({ year: 1 });
MainsQuestionSchema.index({ subjectName: 1 });
MainsQuestionSchema.index({ topicName: 1 });
MainsQuestionSchema.index({ taxonomyIds: 1 });
MainsQuestionSchema.index({ difficulty: 1 });
MainsQuestionSchema.index({ keywords: 1 });

MainsQuestionSchema.index({
    questionText: 'text',
    subjectName: 'text',
    topicName: 'text',
    keywords: 'text'
});

module.exports =
    mongoose.model(
        'MainsQuestion',
        MainsQuestionSchema
    );
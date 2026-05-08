const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { _id: false });

const ImageSchema = new mongoose.Schema({
    url: String,
    caption: String,
    cloudinaryId: String,
    pageNumber: Number
}, { _id: false });

const TableSchema = new mongoose.Schema({

    title: {
        type: String,
        default: ''
    },

    headers: [{
        type: String
    }],

    rows: [[{
        type: String
    }]],

    pageNumber: {
        type: Number,
        default: null
    }

}, { _id: false });

const AIMetadataSchema = new mongoose.Schema({

    subject: {
        type: String,
        default: ''
    },

    topic: {
        type: String,
        default: ''
    },

    subtopic: {
        type: String,
        default: ''
    },

    questionType: {

        type: String,

        enum: [
            'Factual',
            'Conceptual',
            'Statement Based',
            'Match the Following',
            'Assertion Reason',
            'Map Based',
            'Chronology',
            'Table Based',
            'Image Based'
        ],

        default: 'Factual'
    },

    difficultyPrediction: {

        type: String,

        enum: ['Easy', 'Medium', 'Hard'],

        default: 'Medium'
    },

    keywords: [String],

    confidenceScore: {

        type: Number,

        default: 0
    }

}, { _id: false });

const QuestionSchema = new mongoose.Schema({

    // =========================
    // CORE QUESTION DATA
    // =========================

    questionText: {
        type: String,
        required: true
    },

    options: [OptionSchema],

    correctOption: {
        type: String,
        required: true
    },

    explanation: {
        type: String,
        default: ""
    },

    // =========================
    // QUESTION TYPE
    // =========================

    questionFormat: {
        type: String,
        enum: [
            'Text',
            'Image',
            'Table',
            'Mixed'
        ],
        default: 'Text'
    },

    // =========================
    // MEDIA SUPPORT
    // =========================

    images: [ImageSchema],

    tables: [TableSchema],

    // =========================
    // METADATA
    // =========================

    year: {
        type: Number,
        required: true
    },

    examType: {
        type: String,
        enum: ['Prelims', 'Mains'],
        default: 'Prelims'
    },

    paper: {
        type: String,
        default: 'GS1'
    },

    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },

    taxonomyIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Taxonomy'
    }],

    tags: [String],

    normalizedQuestionHash: {
    type: String,
    index: true
},

    // =========================
    // AI ENRICHMENT
    // =========================

    aiMetadata: AIMetadataSchema,

    aiProcessed: {
        type: Boolean,
        default: false
    },

    extractionConfidence: {
        type: Number,
        default: 0
    },

    // =========================
    // SOURCE TRACKING
    // =========================

    source: {
        pdfName: String,
        sourcePage: Number,
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
        default: 'Pending'
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    reviewedAt: Date,

    // =========================
    // ANALYTICS
    // =========================

    isRepeatedConcept: {
        type: Boolean,
        default: false
    },

    normalizedQuestionHash: {
    type: String,
    index: true
},

    timeEstimate: {
        type: Number,
        default: 90
    }

}, {
    timestamps: true
});

QuestionSchema.index({ year: 1 });

QuestionSchema.index({ taxonomyIds: 1 });

QuestionSchema.index({ difficulty: 1 });

QuestionSchema.index({ reviewStatus: 1 });

QuestionSchema.index({ "aiMetadata.subject": 1 });

QuestionSchema.index({ "aiMetadata.topic": 1 });

QuestionSchema.index({ questionFormat: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
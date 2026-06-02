const mongoose = require("mongoose");

// =========================
// UNIFIED DOCUMENT MODEL
// =========================
// Single source of truth:
//   - Always lives in user's vault (folder structure)
//   - "visibility" decides if Community Library shows it
// =========================

const DocumentSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    // =========================
    // B2 STORAGE
    // =========================

    b2Key: {
        type: String,
        required: true
    },

    b2Bucket: {
        type: String,
        required: true
    },

    originalFileName: {
        type: String,
        required: true
    },

    fileSize: {
        type: Number,
        required: true
    },

    originalFileSize: {
    type: Number,
    default: null
},

compressionSavings: {
    type: Number,
    default: 0
},

    mimeType: {
        type: String,
        required: true
    },

    fileType: {
        type: String,
        enum: [
            'pdf',
            'image',
            'doc',
            'ppt',
            'text',
            'other'
        ],
        default: 'other'
    },

    pageCount: {
        type: Number,
        default: null
    },

    // =========================
    // OWNERSHIP
    // =========================

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // =========================
    // FOLDER (always in vault)
    // =========================

    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },

    // =========================
    // VISIBILITY
    // (Single toggle — decides Community visibility)
    // =========================

    visibility: {
        type: String,
        enum: ['private', 'public'],
        default: 'private'
    },

    // =========================
    // CATEGORIZATION
    // =========================

    subject: {
        type: String,
        default: ""
    },

    topic: {
        type: String,
        default: ""
    },

    tags: [String],

    source: {
        type: String,
        default: ""
    },

    // =========================
    // FEATURED (Admin-curated)
    // =========================

    isFeatured: {
        type: Boolean,
        default: false
    },

    featuredAt: {
        type: Date,
        default: null
    },

    featuredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // =========================
    // STATS
    // =========================

    viewCount: {
        type: Number,
        default: 0
    },

    uniqueViewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // =========================
// BOOKMARKS (Community docs)
// =========================

bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}],

// =========================
// RECENT VIEW TRACKING
// =========================

recentViewers: [{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    viewedAt: {
        type: Date,
        default: Date.now
    }
}],

    // =========================
    // MODERATION
    // =========================

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    deletedAt: Date

}, {
    timestamps: true
});

// =========================
// INDEXES
// =========================

DocumentSchema.index({ uploadedBy: 1, folderId: 1 });
DocumentSchema.index({ visibility: 1, isDeleted: 1 });
DocumentSchema.index({ isFeatured: 1, visibility: 1 });
DocumentSchema.index({ subject: 1, topic: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ bookmarkedBy: 1 });
DocumentSchema.index({ "recentViewers.userId": 1, "recentViewers.viewedAt": -1 });
DocumentSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text',
    subject: 'text',
    topic: 'text'
});

module.exports =
    mongoose.model(
        'Document',
        DocumentSchema
    );
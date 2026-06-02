const mongoose = require("mongoose");

// =========================
// FOLDER SCHEMA
// (Unlimited nesting via materialized path)
// =========================

const FolderSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },

    // Materialized path: "/folderId1/folderId2/folderId3"
    // Enables fast ancestor lookups

    path: {
        type: String,
        default: ""
    },

    depth: {
        type: Number,
        default: 0
    },

    // UI customization

    color: {
        type: String,
        default: "blue"
    },

    icon: {
        type: String,
        default: "📁"
    },

    description: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

// =========================
// INDEXES
// =========================

FolderSchema.index({ userId: 1, parentId: 1 });
FolderSchema.index({ userId: 1, path: 1 });
FolderSchema.index({ userId: 1, name: 1 });

module.exports =
    mongoose.model(
        'Folder',
        FolderSchema
    );
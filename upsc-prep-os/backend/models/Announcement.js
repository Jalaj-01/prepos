const mongoose = require("mongoose");

// =========================
// ANNOUNCEMENT SCHEMA
// (Admin-posted notes shown on dashboard)
// =========================

const AnnouncementSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: [
            'info',         // blue
            'success',      // green
            'warning',      // yellow
            'urgent',       // red
            'announcement'  // purple
        ],
        default: 'info'
    },

    isActive: {
        type: Boolean,
        default: true
    },

    expiresAt: {
        type: Date,
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Optional action button

    actionText: {
        type: String,
        default: ""
    },

    actionUrl: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

AnnouncementSchema.index({ isActive: 1, createdAt: -1 });

module.exports =
    mongoose.model(
        'Announcement',
        AnnouncementSchema
    );
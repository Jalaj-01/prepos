const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        // Who receives this notification
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Notification type — extensible for future
        // Current: feedback_admin_reply, feedback_official, feedback_status_change
        // Future: streak_milestone, target_reached, system_announcement, etc.
        type: {
            type: String,
            required: true,
            index: true,
        },

        // Human-readable strings
        title: { type: String, required: true },
        body: { type: String, default: "" },

        // Where clicking the notification should go
        link: { type: String, default: "" },

        // Optional reference to source entity (e.g. FeedbackPost id)
        refType: String,
        refId: { type: mongoose.Schema.Types.ObjectId },

        // Optional actor info (who triggered it)
        actorName: String,
        actorIsAdmin: { type: Boolean, default: false },

        // Read state
        read: { type: Boolean, default: false, index: true },
        readAt: Date,
    },
    { timestamps: true }
);

// For fetching user's unread fast
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
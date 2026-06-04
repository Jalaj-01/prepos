const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        authorName: String,
        isAdminReply: { type: Boolean, default: false },
        content: { type: String, required: true, trim: true, maxlength: 2000 },
        deletedAt: Date,
    },
    { timestamps: true }
);

const FeedbackPostSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        authorName: String,

        title: { type: String, required: true, trim: true, maxlength: 140 },
        content: { type: String, required: true, trim: true, maxlength: 5000 },

        category: {
            type: String,
            enum: ["suggestion", "bug", "question", "praise", "discussion"],
            default: "discussion",
            index: true,
        },

        // Admin "official" announcements get a special look + pin to top
        isOfficial: { type: Boolean, default: false, index: true },

        // Roadmap-style status — admin controlled
        status: {
            type: String,
            enum: ["open", "planned", "in-progress", "shipped", "resolved", "wont-fix"],
            default: "open",
            index: true,
        },

        // Sticky to top — admin controlled
        pinned: { type: Boolean, default: false, index: true },

        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        upvoteCount: { type: Number, default: 0, index: true },

        replies: [ReplySchema],
        replyCount: { type: Number, default: 0 },

        // Lets us detect "new admin activity" for sidebar red dot
        lastAdminActivityAt: { type: Date, index: true },

        deletedAt: Date,
    },
    { timestamps: true }
);

// Compound index for sorting
FeedbackPostSchema.index({ pinned: -1, isOfficial: -1, createdAt: -1 });
FeedbackPostSchema.index({ pinned: -1, upvoteCount: -1, createdAt: -1 });

module.exports = mongoose.model("FeedbackPost", FeedbackPostSchema);
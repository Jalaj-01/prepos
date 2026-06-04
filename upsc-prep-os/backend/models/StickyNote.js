const mongoose = require("mongoose");

// =========================
// STICKY NOTE SCHEMA
// =========================

const StickyNoteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            default: "",
            maxlength: 200
        },

        // Rich text HTML (Tiptap output)
        body: {
            type: String,
            default: ""
        },

        // Plain text version for search & previews
        plainText: {
            type: String,
            default: ""
        },

        color: {
            type: String,
            enum: ["yellow", "pink", "blue", "green", "purple", "orange"],
            default: "yellow"
        },

        pinned: {
            type: Boolean,
            default: false,
            index: true
        },

        // Optional image attachments (Cloudinary URLs)
        images: [
            {
                url: String,
                publicId: String
            }
        ],

        // Optional link to a Question / MainsQuestion
        linkedQuestion: {
            type: {
                type: String,
                enum: ["prelims", "mains", null],
                default: null
            },
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            }
        },

        // Soft sort order (manual reordering via drag-drop)
        position: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// =========================
// INDEXES
// =========================
StickyNoteSchema.index({ userId: 1, pinned: -1, updatedAt: -1 });
StickyNoteSchema.index({ userId: 1, color: 1 });
StickyNoteSchema.index({
    title: "text",
    plainText: "text"
});

module.exports = mongoose.model("StickyNote", StickyNoteSchema);
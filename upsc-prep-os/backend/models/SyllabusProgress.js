const mongoose = require("mongoose");

const SyllabusProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Stable string identifier for the syllabus node.
        // Examples:
        //   official:prelims.gs.history.modern.revolt-1857
        //   taxonomy:64fa9b...
        nodeKey: {
            type: String,
            required: true,
            index: true,
        },

        // Human-readable label cached so bookmarks drawer doesn't need joins.
        nodeLabel: {
            type: String,
            default: "",
        },

        // Breadcrumb path for the bookmarks drawer e.g.
        // "Prelims › GS Paper I › History › Modern India › Revolt of 1857"
        breadcrumb: {
            type: String,
            default: "",
        },

        covered: {
            type: Boolean,
            default: false,
        },

        bookmarked: {
            type: Boolean,
            default: false,
        },

        lastVisitedAt: Date,
    },
    { timestamps: true }
);

// One progress doc per (user, node)
SyllabusProgressSchema.index(
    { userId: 1, nodeKey: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "SyllabusProgress",
    SyllabusProgressSchema
);
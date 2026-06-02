const mongoose =
    require("mongoose");

// =========================
// USER STORAGE QUOTA
// One document per user
// =========================

const UserQuotaSchema =
    new mongoose.Schema({

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            unique: true,

            index: true
        },

        usedBytes: {
            type: Number,
            default: 0
        },

        fileCount: {
            type: Number,
            default: 0
        },

        // Custom limit (admin can override)

        customLimitBytes: {
            type: Number,
            default: null
        },

        lastUploadAt: {
            type: Date
        }

    }, {
        timestamps: true
    });

module.exports =
    mongoose.model(
        "UserQuota",
        UserQuotaSchema
    );
const mongoose =
    require("mongoose");

// =========================
// GLOBAL STORAGE QUOTA
// Singleton: only 1 document ever
// =========================

const StorageQuotaSchema =
    new mongoose.Schema({

        // Singleton key

        key: {
            type: String,
            default: "global",
            unique: true,
            required: true
        },

        // =========================
        // LIMITS (in bytes)
        // =========================

        maxStorageBytes: {

            type: Number,

            // 9.5 GB safety buffer
            // (R2 free = 10 GB)
            default:
                9.5 * 1024 * 1024 * 1024
        },

        maxPerUserBytes: {

            type: Number,

            // 200 MB per user
            default:
                200 * 1024 * 1024
        },

        maxFileSizeBytes: {

            type: Number,

            // 50 MB per single file
            default:
                50 * 1024 * 1024
        },

        // =========================
        // CURRENT USAGE
        // =========================

        currentUsageBytes: {
            type: Number,
            default: 0
        },

        totalFiles: {
            type: Number,
            default: 0
        },

        // =========================
        // ALERT THRESHOLDS
        // =========================

        warningThreshold: {

            type: Number,

            // 70% = first warning
            default: 0.70
        },

        criticalThreshold: {

            type: Number,

            // 85% = critical alert
            default: 0.85
        },

        lockoutThreshold: {

            type: Number,

            // 95% = block uploads
            default: 0.95
        },

        // =========================
        // STATUS
        // =========================

        isLocked: {
            type: Boolean,
            default: false
        },

        lockReason: {
            type: String,
            default: ""
        },

        lastAlertSent: {
            type: Date
        }

    }, {
        timestamps: true
    });

// =========================
// VIRTUAL: USAGE PERCENTAGE
// =========================

StorageQuotaSchema.virtual("usagePercent")
    .get(function () {

        return (
            (this.currentUsageBytes /
                this.maxStorageBytes) *
            100
        );
    });

StorageQuotaSchema.virtual("remainingBytes")
    .get(function () {

        return Math.max(
            this.maxStorageBytes -
                this.currentUsageBytes,
            0
        );
    });

// Ensure virtuals show in JSON

StorageQuotaSchema.set("toJSON", {
    virtuals: true
});

module.exports =
    mongoose.model(
        "StorageQuota",
        StorageQuotaSchema
    );
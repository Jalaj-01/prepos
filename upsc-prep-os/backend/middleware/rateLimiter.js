const rateLimit = require("express-rate-limit");

// =========================
// COMMON CONFIG
// =========================

const baseConfig = {

    standardHeaders: true,

    legacyHeaders: false,

    // Cleaner JSON for frontend
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
};

// =========================
// GENERAL — much more generous now
// =========================

const generalLimiter =
    rateLimit({

        ...baseConfig,

        windowMs:
            15 * 60 * 1000,         // 15 minutes

        max: 3000,                   // 3000 / 15min (was 300 — way too low)

        message: {
            message:
                "Too many requests. Please try again in 15 minutes."
        }
    });

// =========================
// AUTH (strict — brute force)
// =========================

const authLimiter =
    rateLimit({

        ...baseConfig,

        windowMs:
            15 * 60 * 1000,

        max: 30,                     // 30 attempts/15min (was 10 — too strict)

        message: {
            message:
                "Too many login attempts. Please wait 15 minutes."
        },

        skipSuccessfulRequests: true   // only count failures
    });

// =========================
// UPLOAD
// =========================

const uploadLimiter =
    rateLimit({

        ...baseConfig,

        windowMs:
            60 * 60 * 1000,         // 1 hour

        max: 100,                    // 100 uploads/hr (was 50)

        message: {
            message:
                "Upload limit reached. Please try again in 1 hour."
        }
    });

// =========================
// SEARCH
// =========================

const searchLimiter =
    rateLimit({

        ...baseConfig,

        windowMs:
            1 * 60 * 1000,           // 1 minute

        max: 120,                    // 120 searches/min (was 100)

        message: {
            message:
                "Too many searches. Slow down a bit!"
        }
    });

// =========================
// WRITE (creating/updating)
// =========================

const writeLimiter =
    rateLimit({

        ...baseConfig,

        windowMs:
            10 * 60 * 1000,

        max: 300,                    // 300 writes/10min (was 100)

        message: {
            message:
                "Too many actions. Please slow down."
        }
    });

// =========================
// POLLING — very generous (for unread counts, indicators)
// =========================

const pollingLimiter =
    rateLimit({

        ...baseConfig,

        windowMs:
            1 * 60 * 1000,           // 1 minute

        max: 120,                    // 120/min — covers all polling

        message: {
            message: "Too many requests."
        }
    });

module.exports = {

    generalLimiter,

    authLimiter,

    uploadLimiter,

    searchLimiter,

    writeLimiter,

    pollingLimiter
};
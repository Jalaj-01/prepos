const rateLimit =
    require("express-rate-limit");

// =========================
// GENERAL API LIMITER
// (Default for all routes)
// =========================

const generalLimiter =
    rateLimit({

        windowMs:
            15 * 60 * 1000,         // 15 minutes

        max: 300,                    // 300 requests per window

        message: {

            message:
                "Too many requests. Please try again in 15 minutes."
        },

        standardHeaders: true,

        legacyHeaders: false
    });

// =========================
// AUTH LIMITER
// (Strict — prevent brute force)
// =========================

const authLimiter =
    rateLimit({

        windowMs:
            15 * 60 * 1000,         // 15 minutes

        max: 10,                     // 10 login attempts per window

        message: {

            message:
                "Too many login attempts. Please wait 15 minutes."
        },

        standardHeaders: true,

        legacyHeaders: false,

        skipSuccessfulRequests: true   // Only count failures
    });

// =========================
// UPLOAD LIMITER
// (Prevent storage abuse)
// =========================

const uploadLimiter =
    rateLimit({

        windowMs:
            60 * 60 * 1000,         // 1 hour

        max: 50,                     // 50 uploads per hour

        message: {

            message:
                "Upload limit reached. Please try again in 1 hour."
        },

        standardHeaders: true,

        legacyHeaders: false
    });

// =========================
// SEARCH / READ LIMITER
// (More generous)
// =========================

const searchLimiter =
    rateLimit({

        windowMs:
            1 * 60 * 1000,           // 1 minute

        max: 100,                    // 100 searches per min

        message: {

            message:
                "Too many searches. Slow down a bit!"
        },

        standardHeaders: true,

        legacyHeaders: false
    });

// =========================
// WRITE LIMITER
// (Creating/updating data)
// =========================

const writeLimiter =
    rateLimit({

        windowMs:
            10 * 60 * 1000,         // 10 minutes

        max: 100,                    // 100 writes per 10 min

        message: {

            message:
                "Too many actions. Please slow down."
        },

        standardHeaders: true,

        legacyHeaders: false
    });

module.exports = {

    generalLimiter,

    authLimiter,

    uploadLimiter,

    searchLimiter,

    writeLimiter
};
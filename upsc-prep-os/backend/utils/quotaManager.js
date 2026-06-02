const StorageQuota =
    require("../models/StorageQuota");

const UserQuota =
    require("../models/UserQuota");

// =========================
// GET OR CREATE GLOBAL QUOTA
// =========================

const getGlobalQuota = async () => {

    let quota =
        await StorageQuota.findOne({
            key: "global"
        });

    if (!quota) {

        quota =
            await StorageQuota.create({
                key: "global"
            });
    }

    return quota;
};

// =========================
// GET OR CREATE USER QUOTA
// =========================

const getUserQuota = async (
    userId
) => {

    let userQuota =
        await UserQuota.findOne({
            userId
        });

    if (!userQuota) {

        userQuota =
            await UserQuota.create({
                userId
            });
    }

    return userQuota;
};

// =========================
// CHECK IF UPLOAD ALLOWED
// =========================

const checkUploadAllowed = async (
    userId,
    fileSizeBytes
) => {

    const global =
        await getGlobalQuota();

    const userQuota =
        await getUserQuota(userId);

    // =========================
    // 1. CHECK GLOBAL LOCK
    // =========================

    if (global.isLocked) {

        return {

            allowed: false,

            reason:
                "STORAGE_LOCKED",

            message:
                global.lockReason ||
                "Storage is currently locked by admin. Please try later."
        };
    }

    // =========================
    // 2. CHECK FILE SIZE LIMIT
    // =========================

    if (
        fileSizeBytes >
        global.maxFileSizeBytes
    ) {

        return {

            allowed: false,

            reason:
                "FILE_TOO_LARGE",

            message:
                `File too large. Max allowed: ${formatBytes(global.maxFileSizeBytes)}`
        };
    }

    // =========================
    // 3. CHECK GLOBAL LOCKOUT
    // (95% threshold)
    // =========================

    const projectedGlobalUsage =
        global.currentUsageBytes +
        fileSizeBytes;

    const projectedGlobalPercent =
        projectedGlobalUsage /
        global.maxStorageBytes;

    if (
        projectedGlobalPercent >=
        global.lockoutThreshold
    ) {

        return {

            allowed: false,

            reason:
                "GLOBAL_QUOTA_EXCEEDED",

            message:
                `System storage nearly full (${Math.round(projectedGlobalPercent * 100)}%). New uploads temporarily disabled. Contact admin.`
        };
    }

    // =========================
    // 4. CHECK PER-USER LIMIT
    // =========================

    const userLimit =
        userQuota.customLimitBytes ||
        global.maxPerUserBytes;

    const projectedUserUsage =
        userQuota.usedBytes +
        fileSizeBytes;

    if (
        projectedUserUsage >
        userLimit
    ) {

        return {

            allowed: false,

            reason:
                "USER_QUOTA_EXCEEDED",

            message:
                `You've reached your storage limit (${formatBytes(userLimit)}). Delete some files to free up space.`,

            currentUsage:
                userQuota.usedBytes,

            limit:
                userLimit
        };
    }

    // =========================
    // ALLOWED ✅
    // =========================

    return {

        allowed: true,

        reason: "OK",

        currentUsage:
            userQuota.usedBytes,

        limit:
            userLimit,

        globalUsagePercent:
            Math.round(projectedGlobalPercent * 100)
    };
};

// =========================
// REGISTER UPLOAD
// (Call AFTER successful R2 upload)
// =========================

const registerUpload = async (
    userId,
    fileSizeBytes
) => {

    const global =
        await getGlobalQuota();

    const userQuota =
        await getUserQuota(userId);

    // Update global

    global.currentUsageBytes +=
        fileSizeBytes;

    global.totalFiles += 1;

    // Check warning thresholds

    const usagePercent =
        global.currentUsageBytes /
        global.maxStorageBytes;

    if (
        usagePercent >=
            global.criticalThreshold &&
        shouldSendAlert(global)
    ) {

        console.warn(
            `🚨 CRITICAL: Storage at ${Math.round(usagePercent * 100)}%`
        );

        global.lastAlertSent =
            new Date();

        // TODO: Send admin email here

    } else if (
        usagePercent >=
            global.warningThreshold &&
        shouldSendAlert(global)
    ) {

        console.warn(
            `⚠️ WARNING: Storage at ${Math.round(usagePercent * 100)}%`
        );

        global.lastAlertSent =
            new Date();
    }

    await global.save();

    // Update user

    userQuota.usedBytes +=
        fileSizeBytes;

    userQuota.fileCount += 1;

    userQuota.lastUploadAt =
        new Date();

    await userQuota.save();

    return {
        global,
        userQuota
    };
};

// =========================
// REGISTER DELETE
// (Call AFTER successful R2 delete)
// =========================

const registerDelete = async (
    userId,
    fileSizeBytes
) => {

    const global =
        await getGlobalQuota();

    const userQuota =
        await getUserQuota(userId);

    // Update global

    global.currentUsageBytes =
        Math.max(
            global.currentUsageBytes -
                fileSizeBytes,
            0
        );

    global.totalFiles =
        Math.max(
            global.totalFiles - 1,
            0
        );

    await global.save();

    // Update user

    userQuota.usedBytes =
        Math.max(
            userQuota.usedBytes -
                fileSizeBytes,
            0
        );

    userQuota.fileCount =
        Math.max(
            userQuota.fileCount - 1,
            0
        );

    await userQuota.save();

    return {
        global,
        userQuota
    };
};

// =========================
// HELPER: SHOULD SEND ALERT
// (Don't spam — max 1 per 24h)
// =========================

const shouldSendAlert = (
    quota
) => {

    if (!quota.lastAlertSent) return true;

    const hoursSinceLast =
        (Date.now() -
            new Date(quota.lastAlertSent).getTime()) /
        (1000 * 60 * 60);

    return hoursSinceLast >= 24;
};

// =========================
// HELPER: FORMAT BYTES
// =========================

const formatBytes = (
    bytes
) => {

    if (bytes === 0) return "0 B";

    const sizes = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );

    return (
        (bytes / Math.pow(1024, i))
            .toFixed(2) +
        " " +
        sizes[i]
    );
};

module.exports = {

    getGlobalQuota,

    getUserQuota,

    checkUploadAllowed,

    registerUpload,

    registerDelete,

    formatBytes
};
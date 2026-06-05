const User =
    require("../models/User");

// =========================
// QUOTA TIERS (in bytes)
// =========================

const QUOTA_TIERS = {

    free:
        100 * 1024 * 1024,         // 100 MB

    verified:
        250 * 1024 * 1024,         // 250 MB

    premium:
        2 * 1024 * 1024 * 1024,    // 2 GB

    admin:
        5 * 1024 * 1024 * 1024     // 5 GB
};

// =========================
// GET USER STORAGE INFO
// =========================

const getUserStorageInfo = async (
    userId
) => {

    const user =
        await User

            .findById(userId)

            .select(
                "storageUsedBytes storageQuotaBytes userTier"
            );

    if (!user) {

        throw new Error(
            "User not found"
        );
    }

    const usedBytes =
        user.storageUsedBytes || 0;

    const quotaBytes =
        user.storageQuotaBytes ||
        QUOTA_TIERS.free;

    const remainingBytes =
        Math.max(
            quotaBytes - usedBytes,
            0
        );

    const usedPercentage =
        quotaBytes > 0
            ? Math.round(
                (usedBytes / quotaBytes) * 100
            )
            : 0;

    return {

        usedBytes,

        quotaBytes,

        remainingBytes,

        usedPercentage,

        usedMB:
            (usedBytes / (1024 * 1024))
                .toFixed(2),

        quotaMB:
            (quotaBytes / (1024 * 1024))
                .toFixed(2),

        remainingMB:
            (remainingBytes / (1024 * 1024))
                .toFixed(2),

        tier:
            user.userTier || "free",

        isFull:
            usedBytes >= quotaBytes,

        isNearLimit:
            usedPercentage >= 80
    };
};

// =========================
// CHECK IF UPLOAD ALLOWED
// =========================

const canUserUpload = async (
    userId,
    fileSizeBytes
) => {

    const info =
        await getUserStorageInfo(userId);

    if (
        info.usedBytes + fileSizeBytes >
        info.quotaBytes
    ) {

        const overByMB =
            (
                (
                    info.usedBytes +
                    fileSizeBytes -
                    info.quotaBytes
                ) / (1024 * 1024)
            ).toFixed(2);

        return {

            allowed: false,

            reason:
                `Upload would exceed your ${info.quotaMB} MB storage quota by ${overByMB} MB. Please delete some files or upgrade your tier.`,

            currentUsage:
                info
        };
    }

    return {

        allowed: true,

        currentUsage:
            info
    };
};

// =========================
// ADD BYTES TO USER USAGE
// (Call after successful upload)
// =========================

const addStorageUsage = async (
    userId,
    bytes
) => {

    await User.findByIdAndUpdate(

        userId,

        {
            $inc: {
                storageUsedBytes: bytes
            }
        }
    );
};

// =========================
// REMOVE BYTES FROM USER USAGE
// (Call after file delete)
// =========================

const removeStorageUsage = async (
    userId,
    bytes
) => {

    const user =
        await User.findById(userId);

    if (!user) return;

    const newUsage =
        Math.max(
            (user.storageUsedBytes || 0) - bytes,
            0
        );

    user.storageUsedBytes = newUsage;

    await user.save();
};

// =========================
// UPGRADE USER TIER
// (Admin only / Auto on email verify)
// =========================

const upgradeUserTier = async (
    userId,
    newTier
) => {

    if (!QUOTA_TIERS[newTier]) {

        throw new Error(
            `Invalid tier: ${newTier}`
        );
    }

    await User.findByIdAndUpdate(

        userId,

        {
            userTier: newTier,

            storageQuotaBytes:
                QUOTA_TIERS[newTier]
        }
    );

    return {

        success: true,

        newTier,

        newQuotaBytes:
            QUOTA_TIERS[newTier]
    };
};

// =========================
// FORMAT BYTES TO READABLE
// =========================

const formatBytes = (bytes) => {

    if (bytes === 0) return "0 B";

    const k = 1024;

    const sizes = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const i =
        Math.floor(
            Math.log(bytes) / Math.log(k)
        );

    return (

        parseFloat(
            (bytes / Math.pow(k, i))
                .toFixed(2)
        )

        + " " + sizes[i]
    );
};
// =========================
// RECALCULATE USER STORAGE FROM ACTUAL DOCUMENTS
// (Fixes desync from failed uploads, manual DB edits, etc.)
// =========================

const recalcUserStorage = async (userId) => {

    const Document =
        require("../models/Document");

    // Sum up sizeBytes from all NON-deleted documents owned by user

    const result =
        await Document.aggregate([

            {
                $match: {

                    uploadedBy:
                        new (require("mongoose")).Types.ObjectId(userId),

                    // Adjust if your model uses isDeleted differently
                    isDeleted: { $ne: true }
                }
            },

            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$sizeBytes"
                    }
                }
            }
        ]);

    const actualUsed =
        result[0]?.total || 0;

    await User.findByIdAndUpdate(

        userId,

        {
            storageUsedBytes:
                actualUsed
        }
    );

    return actualUsed;
};

module.exports = {

    QUOTA_TIERS,

    getUserStorageInfo,

    canUserUpload,

    addStorageUsage,

    removeStorageUsage,

    upgradeUserTier,

    formatBytes,

    recalcUserStorage      // ← ADD THIS
};
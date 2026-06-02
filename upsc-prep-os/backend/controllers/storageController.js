const {

    getUserStorageInfo,

    upgradeUserTier,

    QUOTA_TIERS

} = require("../utils/storageManager");

const User =
    require("../models/User");

// =========================
// GET MY STORAGE INFO
// =========================

exports.getMyStorage = async (
    req,
    res
) => {

    try {

        const info =
            await getUserStorageInfo(
                req.user._id
            );

        res.json(info);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — GET ALL USERS' STORAGE
// =========================

exports.getAllUsersStorage = async (
    req,
    res
) => {

    try {

        const users =
            await User

                .find({})

                .select(
                    "name email storageUsedBytes storageQuotaBytes userTier"
                )

                .sort({
                    storageUsedBytes: -1
                });

        const userList =
            users.map(u => ({

                _id: u._id,

                name: u.name,

                email: u.email,

                tier:
                    u.userTier || "free",

                usedMB:
                    (
                        (u.storageUsedBytes || 0) /
                        (1024 * 1024)
                    ).toFixed(2),

                quotaMB:
                    (
                        (u.storageQuotaBytes || 100 * 1024 * 1024) /
                        (1024 * 1024)
                    ).toFixed(2),

                usedPercentage:
                    Math.round(
                        (
                            (u.storageUsedBytes || 0) /
                            (u.storageQuotaBytes || 100 * 1024 * 1024)
                        ) * 100
                    )
            }));

        // Calculate platform totals

        const totalUsedBytes =
            users.reduce(

                (sum, u) =>
                    sum + (u.storageUsedBytes || 0),

                0
            );

        const platformLimit =
            10 * 1024 * 1024 * 1024;    // 10 GB

        res.json({

            users:
                userList,

            platform: {

                totalUsedMB:
                    (totalUsedBytes / (1024 * 1024))
                        .toFixed(2),

                totalLimitMB:
                    (platformLimit / (1024 * 1024))
                        .toFixed(2),

                totalUsedPercentage:
                    Math.round(
                        (totalUsedBytes / platformLimit) * 100
                    ),

                totalUsers:
                    users.length
            }
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — UPGRADE USER TIER
// =========================

exports.upgradeTier = async (
    req,
    res
) => {

    try {

        const {
            userId
        } = req.params;

        const {
            tier
        } = req.body;

        if (!QUOTA_TIERS[tier]) {

            return res.status(400).json({

                message:
                    "Invalid tier. Allowed: free, verified, premium, admin"
            });
        }

        const result =
            await upgradeUserTier(
                userId,
                tier
            );

        res.json({

            message:
                `User tier upgraded to ${tier}`,

            ...result
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — SET CUSTOM QUOTA
// =========================

exports.setCustomQuota = async (
    req,
    res
) => {

    try {

        const {
            userId
        } = req.params;

        const {
            quotaMB
        } = req.body;

        if (
            !quotaMB ||
            quotaMB < 0
        ) {

            return res.status(400).json({

                message:
                    "quotaMB must be a positive number"
            });
        }

        const quotaBytes =
            quotaMB * 1024 * 1024;

        await User.findByIdAndUpdate(

            userId,

            {
                storageQuotaBytes:
                    quotaBytes
            }
        );

        res.json({

            message:
                `Custom quota set to ${quotaMB} MB`,

            userId,

            newQuotaBytes:
                quotaBytes
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};
const Announcement =
    require("../models/Announcement");

// =========================
// GET ACTIVE ANNOUNCEMENTS
// (For all users)
// =========================

exports.getActive = async (
    req,
    res
) => {

    try {

        const now = new Date();

        const announcements =
            await Announcement

                .find({

                    isActive: true,

                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: now } }
                    ]
                })

                .populate(
                    "createdBy",
                    "name"
                )

                .sort({
                    createdAt: -1
                })

                .limit(5);

        res.json(announcements);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — GET ALL
// =========================

exports.getAll = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        const announcements =
            await Announcement

                .find({})

                .populate(
                    "createdBy",
                    "name"
                )

                .sort({
                    createdAt: -1
                });

        res.json(announcements);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — CREATE
// =========================

exports.create = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        const {
            title,
            message,
            type,
            expiresAt,
            actionText,
            actionUrl
        } = req.body;

        if (!title || !title.trim()) {

            return res.status(400).json({
                message: "Title is required"
            });
        }

        if (!message || !message.trim()) {

            return res.status(400).json({
                message: "Message is required"
            });
        }

        const announcement =
            await Announcement.create({

                title:
                    title.trim(),

                message:
                    message.trim(),

                type:
                    type || "info",

                expiresAt:
                    expiresAt || null,

                actionText:
                    actionText ? actionText.trim() : "",

                actionUrl:
                    actionUrl ? actionUrl.trim() : "",

                createdBy:
                    req.user._id
            });

        res.status(201).json(announcement);

    } catch (err) {

        console.error(
            "Create Announcement Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — UPDATE
// =========================

exports.update = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        const ann =
            await Announcement.findById(
                req.params.id
            );

        if (!ann) {

            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        const {
            title,
            message,
            type,
            isActive,
            expiresAt,
            actionText,
            actionUrl
        } = req.body;

        if (title !== undefined) ann.title = title.trim();

        if (message !== undefined) ann.message = message.trim();

        if (type !== undefined) ann.type = type;

        if (isActive !== undefined) ann.isActive = isActive;

        if (expiresAt !== undefined) ann.expiresAt = expiresAt;

        if (actionText !== undefined) ann.actionText = actionText.trim();

        if (actionUrl !== undefined) ann.actionUrl = actionUrl.trim();

        await ann.save();

        res.json(ann);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — DELETE
// =========================

exports.remove = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        await Announcement.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "Announcement deleted"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

// =========================
// ADMIN — TOGGLE ACTIVE
// =========================

exports.toggleActive = async (
    req,
    res
) => {

    try {

        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin only"
            });
        }

        const ann =
            await Announcement.findById(
                req.params.id
            );

        if (!ann) {

            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        ann.isActive = !ann.isActive;

        await ann.save();

        res.json(ann);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};
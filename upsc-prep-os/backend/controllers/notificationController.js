const Notification = require("../models/Notification");

// Reusable auth guard — extra safety net even though protect middleware should catch this
const requireUser = (req, res) => {
    if (!req.user?._id) {
        res.status(401).json({ message: "Not authenticated" });
        return false;
    }
    return true;
};

// =========================
// LIST NOTIFICATIONS (last 10 by default)
// GET /api/notifications?limit=10
// =========================
exports.listNotifications = async (req, res) => {
    try {
        if (!requireUser(req, res)) return;

        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const notes = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.json({ notifications: notes });
    } catch (err) {
        console.error("listNotifications:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// UNREAD COUNT
// GET /api/notifications/unread-count
// =========================
exports.unreadCount = async (req, res) => {
    try {
        if (!requireUser(req, res)) return;

        const count = await Notification.countDocuments({
            userId: req.user._id,
            read: false,
        });
        res.json({ count });
    } catch (err) {
        console.error("unreadCount:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// MARK ONE READ
// PATCH /api/notifications/:id/read
// =========================
exports.markRead = async (req, res) => {
    try {
        if (!requireUser(req, res)) return;

        const note = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: { read: true, readAt: new Date() } },
            { new: true }
        );
        if (!note) return res.status(404).json({ message: "Not found" });
        res.json({ notification: note });
    } catch (err) {
        console.error("markRead:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// MARK ALL READ
// PATCH /api/notifications/read-all
// =========================
exports.markAllRead = async (req, res) => {
    try {
        if (!requireUser(req, res)) return;

        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true, readAt: new Date() } }
        );
        res.json({ message: "All marked as read" });
    } catch (err) {
        console.error("markAllRead:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// DELETE ONE
// DELETE /api/notifications/:id
// =========================
exports.deleteNotification = async (req, res) => {
    try {
        if (!requireUser(req, res)) return;

        await Notification.deleteOne({
            _id: req.params.id,
            userId: req.user._id,
        });
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("deleteNotification:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// HELPER — create a notification (used by other controllers)
// =========================
exports.create = async ({
    userId,
    type,
    title,
    body = "",
    link = "",
    refType,
    refId,
    actorName,
    actorIsAdmin = false,
}) => {
    try {
        if (!userId) {
            console.warn("Notification.create called without userId — skipped");
            return null;
        }

        return await Notification.create({
            userId,
            type,
            title,
            body,
            link,
            refType,
            refId,
            actorName,
            actorIsAdmin,
        });
    } catch (err) {
        console.warn("Notification create failed:", err.message);
        return null;
    }
};

// =========================
// HELPER — bulk create for all users (used for "Official Updates")
// =========================
exports.createForAllUsers = async ({
    excludeUserId,
    type,
    title,
    body = "",
    link = "",
    refType,
    refId,
    actorName,
    actorIsAdmin = true,
}) => {
    try {
        const User = require("../models/User");

        // Fetch all active user IDs (skip deleted, skip the actor themselves)
        const filter = { isDeleted: { $ne: true } };
        if (excludeUserId) filter._id = { $ne: excludeUserId };

        const users = await User.find(filter).select("_id").lean();
        if (!users.length) return 0;

        const docs = users.map((u) => ({
            userId: u._id,
            type,
            title,
            body,
            link,
            refType,
            refId,
            actorName,
            actorIsAdmin,
        }));

        // Insert in chunks to avoid huge single inserts
        const CHUNK = 500;
        let inserted = 0;
        for (let i = 0; i < docs.length; i += CHUNK) {
            const batch = docs.slice(i, i + CHUNK);
            await Notification.insertMany(batch, { ordered: false });
            inserted += batch.length;
        }
        return inserted;
    } catch (err) {
        console.warn("Bulk notification create failed:", err.message);
        return 0;
    }
};
const mongoose = require("mongoose");
const FeedbackPost = require("../models/FeedbackPost");
const User = require("../models/User");
const notif = require("./notificationController");

const isSuper = (req) => {
    const superEmail = (process.env.SUPER_ADMIN_EMAIL || "")
        .toLowerCase()
        .trim();
    return (
        req.user &&
        (req.user.email || "").toLowerCase().trim() === superEmail
    );
};

// =========================
// LIST POSTS
// GET /api/feedback?category=&status=&sort=&search=&page=&limit=
// =========================
exports.listPosts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const filter = { deletedAt: null };

        if (req.query.category && req.query.category !== "all") {
            filter.category = req.query.category;
        }
        if (req.query.status && req.query.status !== "all") {
            filter.status = req.query.status;
        }
        if (req.query.officialOnly === "true") {
            filter.isOfficial = true;
        }

        if (req.query.search?.trim()) {
            const safe = req.query.search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { title: { $regex: safe, $options: "i" } },
                { content: { $regex: safe, $options: "i" } },
            ];
        }

        // Sort
        let sort = { pinned: -1, isOfficial: -1, createdAt: -1 };
        if (req.query.sort === "top") {
            sort = { pinned: -1, upvoteCount: -1, createdAt: -1 };
        } else if (req.query.sort === "oldest") {
            sort = { pinned: -1, createdAt: 1 };
        }

        const [posts, total] = await Promise.all([
            FeedbackPost.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            FeedbackPost.countDocuments(filter),
        ]);

        // Decorate with "hasUpvoted"
        const userId = String(req.user._id);
        posts.forEach((p) => {
            p.hasUpvoted = (p.upvotes || []).some(
                (u) => String(u) === userId
            );
            delete p.upvotes;
            p.replies = (p.replies || []).filter((r) => !r.deletedAt);
        });

        res.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("listPosts:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// CREATE POST
// POST /api/feedback
// body: { title, content, category, isOfficial }
// =========================
exports.createPost = async (req, res) => {
    try {
        const { title, content, category, isOfficial } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res
                .status(400)
                .json({ message: "Title and content are required" });
        }

        // Only admins can mark official
        const wantOfficial = !!isOfficial;
        if (wantOfficial && !req.user.isAdmin) {
            return res
                .status(403)
                .json({ message: "Only admins can post official updates" });
        }

        const post = await FeedbackPost.create({
            author: req.user._id,
            authorName: req.user.name,
            title: title.trim(),
            content: content.trim(),
            category: category || "discussion",
            isOfficial: wantOfficial,
            pinned: wantOfficial, // official posts auto-pin
            lastAdminActivityAt:
                req.user.isAdmin || wantOfficial ? new Date() : null,
        });

        // If Official Update — notify everyone (except the author)
        if (wantOfficial) {
            notif.createForAllUsers({
                excludeUserId: req.user._id,
                type: "feedback_official",
                title: `📢 ${req.user.name} posted an Official Update`,
                body: post.title,
                link: "/feedback",
                refType: "FeedbackPost",
                refId: post._id,
                actorName: req.user.name,
                actorIsAdmin: true,
            });
        }

        res.status(201).json({ post });
    } catch (err) {
        console.error("createPost:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// DELETE POST (soft)
// DELETE /api/feedback/:id
// =========================
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await FeedbackPost.findById(id);
        if (!post || post.deletedAt) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Author OR any admin can delete
        const isAuthor = String(post.author) === String(req.user._id);
        if (!isAuthor && !req.user.isAdmin) {
            return res.status(403).json({ message: "Not allowed" });
        }

        post.deletedAt = new Date();
        await post.save();

        res.json({ message: "Post deleted" });
    } catch (err) {
        console.error("deletePost:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// TOGGLE UPVOTE
// POST /api/feedback/:id/upvote
// =========================
exports.toggleUpvote = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await FeedbackPost.findById(id);
        if (!post || post.deletedAt) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userId = req.user._id;
        const idx = post.upvotes.findIndex(
            (u) => String(u) === String(userId)
        );

        if (idx >= 0) {
            post.upvotes.splice(idx, 1);
        } else {
            post.upvotes.push(userId);
        }
        post.upvoteCount = post.upvotes.length;
        await post.save();

        res.json({
            hasUpvoted: idx < 0,
            upvoteCount: post.upvoteCount,
        });
    } catch (err) {
        console.error("toggleUpvote:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// ADD REPLY
// POST /api/feedback/:id/reply
// body: { content }
// =========================
exports.addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ message: "Reply is required" });
        }

        const post = await FeedbackPost.findById(id);
        if (!post || post.deletedAt) {
            return res.status(404).json({ message: "Post not found" });
        }

        const reply = {
            author: req.user._id,
            authorName: req.user.name,
            isAdminReply: !!req.user.isAdmin,
            content: content.trim(),
        };
        post.replies.push(reply);
        post.replyCount = post.replies.filter((r) => !r.deletedAt).length;

        if (req.user.isAdmin) {
            post.lastAdminActivityAt = new Date();
        }

        await post.save();

        // Notify post author when an ADMIN replies (skip if author IS the admin)
        if (
            req.user.isAdmin &&
            String(post.author) !== String(req.user._id)
        ) {
            notif.create({
                userId: post.author,
                type: "feedback_admin_reply",
                title: `💬 Admin replied to your post`,
                body: `${req.user.name} on "${post.title}"`,
                link: "/feedback",
                refType: "FeedbackPost",
                refId: post._id,
                actorName: req.user.name,
                actorIsAdmin: true,
            });
        }

        // Return the new reply (last one)
        res.status(201).json({
            reply: post.replies[post.replies.length - 1],
        });
    } catch (err) {
        console.error("addReply:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// DELETE REPLY (soft)
// DELETE /api/feedback/:id/reply/:replyId
// =========================
exports.deleteReply = async (req, res) => {
    try {
        const { id, replyId } = req.params;
        const post = await FeedbackPost.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const reply = post.replies.id(replyId);
        if (!reply || reply.deletedAt) {
            return res.status(404).json({ message: "Reply not found" });
        }

        const isAuthor = String(reply.author) === String(req.user._id);
        if (!isAuthor && !req.user.isAdmin) {
            return res.status(403).json({ message: "Not allowed" });
        }

        reply.deletedAt = new Date();
        post.replyCount = post.replies.filter((r) => !r.deletedAt).length;
        await post.save();

        res.json({ message: "Reply deleted" });
    } catch (err) {
        console.error("deleteReply:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// ADMIN: SET STATUS / PIN / OFFICIAL FLIPS
// PATCH /api/feedback/:id/admin
// body: { status?, pinned?, isOfficial? }
// =========================
exports.adminUpdate = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Admin only" });
        }

        const { id } = req.params;
        const { status, pinned, isOfficial } = req.body;

        const post = await FeedbackPost.findById(id);
        if (!post || post.deletedAt) {
            return res.status(404).json({ message: "Post not found" });
        }

        const VALID_STATUS = [
            "open",
            "planned",
            "in-progress",
            "shipped",
            "resolved",
            "wont-fix",
        ];

        const prevStatus = post.status;

        if (status && VALID_STATUS.includes(status)) post.status = status;
        if (typeof pinned === "boolean") post.pinned = pinned;
        if (typeof isOfficial === "boolean") post.isOfficial = isOfficial;

        post.lastAdminActivityAt = new Date();
        await post.save();

        // Notify post author on status change (skip if author IS the admin)
        if (
            status &&
            status !== prevStatus &&
            String(post.author) !== String(req.user._id)
        ) {
            const statusEmoji = {
                planned: "📋",
                "in-progress": "🚧",
                shipped: "🚀",
                resolved: "✅",
                "wont-fix": "🚫",
                open: "📂",
            };
            notif.create({
                userId: post.author,
                type: "feedback_status_change",
                title: `${statusEmoji[status] || "🔔"} Your post is now ${status.replace("-", " ")}`,
                body: post.title,
                link: "/feedback",
                refType: "FeedbackPost",
                refId: post._id,
                actorName: req.user.name,
                actorIsAdmin: true,
            });
        }

        res.json({ post });
    } catch (err) {
        console.error("adminUpdate:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// UNREAD INDICATOR
// GET /api/feedback/unread-indicator
// Returns whether there's new admin activity since user's lastSeen
// =========================
exports.unreadIndicator = async (req, res) => {
    try {
        const since = req.query.since
            ? new Date(req.query.since)
            : new Date(0);

        const count = await FeedbackPost.countDocuments({
            deletedAt: null,
            lastAdminActivityAt: { $gt: since },
        });

        res.json({ hasNewAdminActivity: count > 0, count });
    } catch (err) {
        console.error("unreadIndicator:", err);
        res.status(500).json({ message: err.message });
    }
};
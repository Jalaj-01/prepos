const mongoose = require("mongoose");
const User = require("../models/User");
const Attempt = require("../models/Attempt");
const MainsAttempt = require("../models/MainsAttempt");
const Document = require("../models/Document");
const Folder = require("../models/Folder");
const PreparationTrack = require("../models/PreparationTrack");

// Optional models — wrapped in try because they may or may not exist
let StickyNote, Task, SyllabusProgress, Bookmark;
try { StickyNote = require("../models/StickyNote"); } catch {}
try { Task = require("../models/Task"); } catch {}
try { SyllabusProgress = require("../models/SyllabusProgress"); } catch {}
try { Bookmark = require("../models/Bookmark"); } catch {}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// =========================
// LIST USERS (paginated, searchable, filterable)
// GET /api/admin/users?page=1&limit=50&search=&role=&activity=&sort=
// =========================
exports.listUsers = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const skip = (page - 1) * limit;

        const search = (req.query.search || "").trim();
        const role = req.query.role || "all"; // all | admin | user
        const activity = req.query.activity || "all"; // all | active | inactive
        const sort = req.query.sort || "newest";
        const includeDeleted = req.query.includeDeleted === "true";

        // Build filter
        const filter = {};
        if (!includeDeleted) filter.isDeleted = { $ne: true };

        if (search) {
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { name: { $regex: safe, $options: "i" } },
                { email: { $regex: safe, $options: "i" } },
            ];
        }

        if (role === "admin") filter.isAdmin = true;
        if (role === "user") filter.isAdmin = { $ne: true };

        const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS);
        if (activity === "active") {
            filter.lastActiveDate = { $gte: sevenDaysAgo };
        }
        if (activity === "inactive") {
            filter.$and = [
                ...(filter.$and || []),
                {
                    $or: [
                        { lastActiveDate: { $lt: sevenDaysAgo } },
                        { lastActiveDate: { $exists: false } },
                        { lastActiveDate: null },
                    ],
                },
            ];
        }

        // Sort map
        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            active: { totalQuestionsSolved: -1 },
            streak: { streak: -1 },
        };
        const sortBy = sortMap[sort] || sortMap.newest;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select(
                    "-password -resetPasswordOTP -resetPasswordOTPExpire -bookmarkedQuestions"
                )
                .sort(sortBy)
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filter),
        ]);

        // Enrich with question attempt counts (cheap aggregate per page)
        const userIds = users.map((u) => u._id);

        const [prelimsCounts, mainsCounts] = await Promise.all([
            Attempt.aggregate([
                { $match: { user: { $in: userIds } } },
                { $group: { _id: "$user", count: { $sum: 1 } } },
            ]).catch(() => []),
            MainsAttempt.aggregate([
                { $match: { user: { $in: userIds } } },
                { $group: { _id: "$user", count: { $sum: 1 } } },
            ]).catch(() => []),
        ]);

        const prelimsMap = new Map(
            prelimsCounts.map((p) => [String(p._id), p.count])
        );
        const mainsMap = new Map(
            mainsCounts.map((p) => [String(p._id), p.count])
        );

        const enriched = users.map((u) => ({
            ...u,
            prelimsAttempts: prelimsMap.get(String(u._id)) || 0,
            mainsAttempts: mainsMap.get(String(u._id)) || 0,
            totalAttempts:
                (prelimsMap.get(String(u._id)) || 0) +
                (mainsMap.get(String(u._id)) || 0),
        }));

        const superEmail = (process.env.SUPER_ADMIN_EMAIL || "")
            .toLowerCase()
            .trim();

        // Summary counts for dashboard chips
        const [totalAll, totalAdmins, activeCount] = await Promise.all([
            User.countDocuments({ isDeleted: { $ne: true } }),
            User.countDocuments({
                isDeleted: { $ne: true },
                isAdmin: true,
            }),
            User.countDocuments({
                isDeleted: { $ne: true },
                lastActiveDate: { $gte: sevenDaysAgo },
            }),
        ]);

        res.json({
            users: enriched,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            summary: {
                total: totalAll,
                admins: totalAdmins,
                activeLast7Days: activeCount,
            },
            superAdminEmail: superEmail,
        });
    } catch (err) {
        console.error("listUsers:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// USER DETAIL
// GET /api/admin/users/:id
// =========================
exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await User.findById(id)
            .select(
                "-password -resetPasswordOTP -resetPasswordOTPExpire"
            )
            .lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        const [
            prelimsTotal,
            prelimsCorrect,
            mainsTotal,
            recentAttempts,
            stickyCount,
            taskCount,
            syllabusCovered,
            syllabusBookmarked,
        ] = await Promise.all([
            Attempt.countDocuments({ user: id }).catch(() => 0),
            Attempt.countDocuments({ user: id, isCorrect: true }).catch(
                () => 0
            ),
            MainsAttempt.countDocuments({ user: id }).catch(() => 0),
            Attempt.find({ user: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("question", "questionText")
                .lean()
                .catch(() => []),
            StickyNote
                ? StickyNote.countDocuments({ userId: id }).catch(() => 0)
                : 0,
            Task ? Task.countDocuments({ userId: id }).catch(() => 0) : 0,
            SyllabusProgress
                ? SyllabusProgress.countDocuments({
                      userId: id,
                      covered: true,
                  }).catch(() => 0)
                : 0,
            SyllabusProgress
                ? SyllabusProgress.countDocuments({
                      userId: id,
                      bookmarked: true,
                  }).catch(() => 0)
                : 0,
        ]);

        const accuracy =
            prelimsTotal > 0
                ? Math.round((prelimsCorrect / prelimsTotal) * 100)
                : 0;

        res.json({
            user,
            stats: {
                prelimsAttempts: prelimsTotal,
                prelimsCorrect,
                prelimsAccuracy: accuracy,
                mainsAttempts: mainsTotal,
                stickyNotes: stickyCount,
                tasks: taskCount,
                syllabusCovered,
                syllabusBookmarked,
                bookmarkedQuestions:
                    user.bookmarkedQuestions?.length || 0,
            },
            recentAttempts,
        });
    } catch (err) {
        console.error("getUserDetail:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// PROMOTE / DEMOTE
// PATCH /api/admin/users/:id/role  { role: 'admin'|'user' }
// =========================
exports.changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["admin", "user"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        // Block changing own role (extra safety)
        if (String(req.user._id) === String(id)) {
            return res.status(400).json({
                message: "You cannot change your own role",
            });
        }

        const target = await User.findById(id);
        if (!target) {
            return res.status(404).json({ message: "User not found" });
        }

        // Block changing the super-admin's role
        const superEmail = (process.env.SUPER_ADMIN_EMAIL || "")
            .toLowerCase()
            .trim();
        if (target.email.toLowerCase().trim() === superEmail) {
            return res.status(400).json({
                message: "Super-admin role cannot be modified",
            });
        }

        target.isAdmin = role === "admin";
        if (role === "admin") target.userTier = "admin";
        await target.save();

        res.json({
            message: `User ${
                role === "admin" ? "promoted to admin" : "demoted to user"
            }`,
            user: {
                _id: target._id,
                isAdmin: target.isAdmin,
                userTier: target.userTier,
            },
        });
    } catch (err) {
        console.error("changeRole:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// SOFT DELETE
// PATCH /api/admin/users/:id/soft-delete  { restore: bool }
// =========================
exports.softDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const restore = !!req.body.restore;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        if (String(req.user._id) === String(id)) {
            return res
                .status(400)
                .json({ message: "You cannot delete your own account" });
        }

        const target = await User.findById(id);
        if (!target)
            return res.status(404).json({ message: "User not found" });

        const superEmail = (process.env.SUPER_ADMIN_EMAIL || "")
            .toLowerCase()
            .trim();
        if (target.email.toLowerCase().trim() === superEmail) {
            return res
                .status(400)
                .json({ message: "Super-admin cannot be deleted" });
        }

        target.isDeleted = !restore;
        target.deletedAt = restore ? null : new Date();
        await target.save();

        res.json({
            message: restore
                ? "User restored"
                : "User soft-deleted (data retained)",
            user: {
                _id: target._id,
                isDeleted: target.isDeleted,
                deletedAt: target.deletedAt,
            },
        });
    } catch (err) {
        console.error("softDelete:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// HARD DELETE (cascade)
// DELETE /api/admin/users/:id   body: { confirm: 'DELETE' }
// =========================
exports.hardDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirm } = req.body;

        if (confirm !== "DELETE") {
            return res.status(400).json({
                message: "Type DELETE to confirm permanent deletion",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        if (String(req.user._id) === String(id)) {
            return res
                .status(400)
                .json({ message: "You cannot delete your own account" });
        }

        const target = await User.findById(id);
        if (!target)
            return res.status(404).json({ message: "User not found" });

        const superEmail = (process.env.SUPER_ADMIN_EMAIL || "")
            .toLowerCase()
            .trim();
        if (target.email.toLowerCase().trim() === superEmail) {
            return res
                .status(400)
                .json({ message: "Super-admin cannot be deleted" });
        }

        // Cascade
        const tasks = [
            Attempt.deleteMany({ user: id }).catch(() => null),
            MainsAttempt.deleteMany({ user: id }).catch(() => null),
            Document.deleteMany({ uploadedBy: id }).catch(() => null),
            Folder.deleteMany({ userId: id }).catch(() => null),
            PreparationTrack.deleteMany({ userId: id }).catch(() => null),
        ];
        if (StickyNote)
            tasks.push(StickyNote.deleteMany({ userId: id }).catch(() => null));
        if (Task)
            tasks.push(Task.deleteMany({ userId: id }).catch(() => null));
        if (SyllabusProgress)
            tasks.push(
                SyllabusProgress.deleteMany({ userId: id }).catch(() => null)
            );
        if (Bookmark)
            tasks.push(
                Bookmark.deleteMany({ userId: id }).catch(() => null)
            );

        await Promise.all(tasks);
        await User.findByIdAndDelete(id);

        res.json({
            message: "User and all associated data permanently deleted",
        });
    } catch (err) {
        console.error("hardDelete:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// WHO AM I (super-admin check helper for frontend)
// GET /api/admin/users/me/super-status
// =========================
exports.superStatus = (req, res) => {
    const superEmail = (process.env.SUPER_ADMIN_EMAIL || "")
        .toLowerCase()
        .trim();

        // 🔍 DEBUG — remove after fixing
    console.log("=== SUPER ADMIN CHECK ===");
    console.log("ENV email:", JSON.stringify(superEmail));
    console.log("User email:", JSON.stringify(req.user.email));
    console.log("Match:", req.user.email.toLowerCase().trim() === superEmail);
    console.log("========================");
    const isSuper =
        req.user &&
        (req.user.email || "").toLowerCase().trim() === superEmail;
    res.json({ isSuperAdmin: !!isSuper });
};
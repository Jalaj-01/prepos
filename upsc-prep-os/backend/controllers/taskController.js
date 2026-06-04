const Task = require("../models/Task");

// =========================
// HELPERS
// =========================

const startOfDay = (d = new Date()) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const endOfDay = (d = new Date()) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
};

const startOfWeek = (d = new Date()) => {
    const x = startOfDay(d);
    x.setDate(x.getDate() - x.getDay()); // Sunday
    return x;
};

const endOfWeek = (d = new Date()) => {
    const x = startOfWeek(d);
    x.setDate(x.getDate() + 6);
    x.setHours(23, 59, 59, 999);
    return x;
};

// Compute next occurrence date based on recurrence rule
const computeNextOccurrence = (task, from = new Date()) => {
    const r = task.recurrence;
    if (!r || r.type === "none") return null;

    const base = new Date(from);
    base.setHours(0, 0, 0, 0);

    if (r.type === "daily") {
        const next = new Date(base);
        next.setDate(next.getDate() + 1);
        return next;
    }

    if (r.type === "weekly") {
        const days = (r.daysOfWeek && r.daysOfWeek.length) ? r.daysOfWeek : [base.getDay()];
        for (let i = 1; i <= 14; i++) {
            const candidate = new Date(base);
            candidate.setDate(candidate.getDate() + i);
            if (days.includes(candidate.getDay())) return candidate;
        }
        return null;
    }

    if (r.type === "monthly") {
        const next = new Date(base);
        next.setMonth(next.getMonth() + 1);
        if (r.dayOfMonth) next.setDate(Math.min(r.dayOfMonth, 28));
        return next;
    }

    if (r.type === "custom" && r.intervalDays > 0) {
        const next = new Date(base);
        next.setDate(next.getDate() + r.intervalDays);
        return next;
    }

    return null;
};

// =========================
// CREATE
// =========================
exports.createTask = async (req, res) => {
    try {
        const body = req.body || {};

        const task = await Task.create({
            userId: req.user._id,
            title: body.title,
            description: body.description || "",
            dueDate: body.dueDate || null,
            dueTime: body.dueTime || null,
            priority: body.priority || "medium",
            category: body.category || "general",
            subtasks: Array.isArray(body.subtasks) ? body.subtasks : [],
            linkedQuestion: body.linkedQuestion || undefined,
            recurrence: body.recurrence || { type: "none" },
            reminder: body.reminder || { enabled: false, minutesBefore: 15 }
        });

        // Initialize nextOccurrence for recurring tasks
        if (task.recurrence?.type && task.recurrence.type !== "none") {
            task.recurrence.nextOccurrence = computeNextOccurrence(
                task,
                task.dueDate || new Date()
            );
            await task.save();
        }

        res.status(201).json(task);
    } catch (err) {
        console.error("Create Task Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// LIST (with filters)
// =========================
exports.getMyTasks = async (req, res) => {
    try {
        const {
            view, // today | week | overdue | all
            category,
            priority,
            status,
            search,
            limit = 200,
            skip = 0
        } = req.query;

        const query = { userId: req.user._id };

        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (status) query.status = status;

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } }
            ];
        }

        if (view === "today") {
            query.dueDate = { $gte: startOfDay(), $lte: endOfDay() };
        } else if (view === "week") {
            query.dueDate = { $gte: startOfWeek(), $lte: endOfWeek() };
        } else if (view === "overdue") {
            query.status = { $ne: "done" };
            query.dueDate = { $lt: startOfDay() };
        }

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .sort({ status: 1, dueDate: 1, priority: -1, createdAt: -1 })
                .skip(parseInt(skip))
                .limit(Math.min(parseInt(limit), 500)),
            Task.countDocuments(query)
        ]);

        res.json({ tasks, total });
    } catch (err) {
        console.error("Get Tasks Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// GET BY ID
// =========================
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// UPDATE
// =========================
exports.updateTask = async (req, res) => {
    try {
        const updates = { ...req.body };

        // Mark completedAt when status flips to done
        if (updates.status === "done") {
            updates.completedAt = new Date();
        } else if (updates.status && updates.status !== "done") {
            updates.completedAt = null;
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        // If recurrence rule changed, recompute nextOccurrence
        if (updates.recurrence && task.recurrence?.type !== "none") {
            task.recurrence.nextOccurrence = computeNextOccurrence(
                task,
                task.dueDate || new Date()
            );
            await task.save();
        }

        res.json(task);
    } catch (err) {
        console.error("Update Task Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// TOGGLE COMPLETE
// =========================
exports.toggleComplete = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.status === "done") {
            task.status = "pending";
            task.completedAt = null;
        } else {
            task.status = "done";
            task.completedAt = new Date();
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// TOGGLE SUBTASK
// =========================
exports.toggleSubtask = async (req, res) => {
    try {
        const { id, subtaskId } = req.params;

        const task = await Task.findOne({ _id: id, userId: req.user._id });
        if (!task) return res.status(404).json({ message: "Task not found" });

        const sub = task.subtasks.id(subtaskId);
        if (!sub) return res.status(404).json({ message: "Subtask not found" });

        sub.done = !sub.done;
        await task.save();

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// DELETE
// =========================
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// REORDER
// =========================
exports.reorderTasks = async (req, res) => {
    try {
        const { order } = req.body;
        if (!Array.isArray(order)) {
            return res.status(400).json({ message: "Invalid order array" });
        }

        const bulkOps = order.map((o) => ({
            updateOne: {
                filter: { _id: o.id, userId: req.user._id },
                update: { position: o.position }
            }
        }));

        if (bulkOps.length) await Task.bulkWrite(bulkOps);
        res.json({ message: "Reordered" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// STATS (dashboard widget + planner header)
// =========================
exports.getTaskStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const sod = startOfDay();
        const eod = endOfDay();
        const eow = endOfWeek();

        const [
            totalActive,
            todayCount,
            overdueCount,
            weekCount,
            doneThisWeek,
            todayTasks
        ] = await Promise.all([
            Task.countDocuments({ userId, status: { $ne: "done" } }),
            Task.countDocuments({
                userId,
                status: { $ne: "done" },
                dueDate: { $gte: sod, $lte: eod }
            }),
            Task.countDocuments({
                userId,
                status: { $ne: "done" },
                dueDate: { $lt: sod }
            }),
            Task.countDocuments({
                userId,
                status: { $ne: "done" },
                dueDate: { $gte: sod, $lte: eow }
            }),
            Task.countDocuments({
                userId,
                status: "done",
                completedAt: { $gte: startOfWeek(), $lte: eow }
            }),
            Task.find({
                userId,
                status: { $ne: "done" },
                $or: [
                    { dueDate: { $gte: sod, $lte: eod } },
                    { dueDate: { $lt: sod } }
                ]
            })
                .sort({ dueDate: 1, priority: -1 })
                .limit(5)
                .select("title category priority dueDate dueTime status subtasks")
        ]);

        // Category breakdown for sidebar
        const categoryAgg = await Task.aggregate([
            { $match: { userId: userId, status: { $ne: "done" } } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const categories = {
            prelims: 0,
            mains: 0,
            revision: 0,
            general: 0
        };
        categoryAgg.forEach((c) => {
            if (categories[c._id] !== undefined) categories[c._id] = c.count;
        });

        res.json({
            totalActive,
            todayCount,
            overdueCount,
            weekCount,
            doneThisWeek,
            categories,
            todayTasks
        });
    } catch (err) {
        console.error("Task Stats Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// DUE REMINDERS (called by cron — internal use; also exposed for client polling)
// =========================
exports.getDueReminders = async (req, res) => {
    try {
        const now = new Date();
        const next2Min = new Date(now.getTime() + 2 * 60 * 1000);

        const due = await Task.find({
            userId: req.user._id,
            status: { $ne: "done" },
            "reminder.enabled": true,
            "reminder.sent": false,
            dueDate: { $gte: now, $lte: next2Min }
        }).limit(10);

        res.json({ due });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark a reminder as sent (client calls after showing the browser notification)
exports.markReminderSent = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { "reminder.sent": true },
            { new: true }
        );
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Export helpers for cron
exports._helpers = { computeNextOccurrence };
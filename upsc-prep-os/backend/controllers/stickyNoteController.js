const StickyNote = require("../models/StickyNote");

// Strip HTML tags to make a plain-text preview / searchable string
const stripHtml = (html) => {
    if (!html) return "";
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

// =========================
// CREATE
// =========================
exports.createNote = async (req, res) => {
    try {
        const { title, body, color, pinned, linkedQuestion } = req.body;

        const note = await StickyNote.create({
            userId: req.user._id,
            title: title || "",
            body: body || "",
            plainText: stripHtml(body || ""),
            color: color || "yellow",
            pinned: !!pinned,
            linkedQuestion: linkedQuestion || undefined
        });

        res.status(201).json(note);
    } catch (err) {
        console.error("Create Sticky Note Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// LIST (with filters)
// =========================
exports.getMyNotes = async (req, res) => {
    try {
        const { color, pinned, search, limit = 100, skip = 0 } = req.query;

        const query = { userId: req.user._id };

        if (color) query.color = color;
        if (pinned === "true") query.pinned = true;
        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { plainText: { $regex: search.trim(), $options: "i" } }
            ];
        }

        const [notes, total] = await Promise.all([
            StickyNote.find(query)
                .sort({ pinned: -1, updatedAt: -1 })
                .skip(parseInt(skip))
                .limit(Math.min(parseInt(limit), 200)),
            StickyNote.countDocuments(query)
        ]);

        res.json({ notes, total });
    } catch (err) {
        console.error("Get Notes Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// GET BY ID
// =========================
exports.getNoteById = async (req, res) => {
    try {
        const note = await StickyNote.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// UPDATE
// =========================
exports.updateNote = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.body !== undefined) {
            updates.plainText = stripHtml(updates.body);
        }

        const note = await StickyNote.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true }
        );

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json(note);
    } catch (err) {
        console.error("Update Note Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// TOGGLE PIN
// =========================
exports.togglePin = async (req, res) => {
    try {
        const note = await StickyNote.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.pinned = !note.pinned;
        await note.save();

        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// UPLOAD IMAGE (called separately, returns URL)
// =========================
exports.uploadNoteImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        res.json({
            url: req.file.path,
            publicId: req.file.filename
        });
    } catch (err) {
        console.error("Upload Note Image Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// DELETE
// =========================
exports.deleteNote = async (req, res) => {
    try {
        const note = await StickyNote.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Note deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// REORDER (bulk update positions)
// =========================
exports.reorderNotes = async (req, res) => {
    try {
        const { order } = req.body; // [{ id, position }, ...]

        if (!Array.isArray(order)) {
            return res.status(400).json({ message: "Invalid order array" });
        }

        const bulkOps = order.map((o) => ({
            updateOne: {
                filter: { _id: o.id, userId: req.user._id },
                update: { position: o.position }
            }
        }));

        if (bulkOps.length) await StickyNote.bulkWrite(bulkOps);

        res.json({ message: "Reordered" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// STATS (for header badge / dashboard widget)
// =========================
exports.getNoteStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [total, pinned, recentNotes] = await Promise.all([
            StickyNote.countDocuments({ userId }),
            StickyNote.countDocuments({ userId, pinned: true }),
            StickyNote.find({ userId })
                .sort({ pinned: -1, updatedAt: -1 })
                .limit(4)
                .select("title color pinned updatedAt plainText")
        ]);

        res.json({ total, pinned, recentNotes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const express = require("express");
const router = express.Router();

const {
    createNote,
    getMyNotes,
    getNoteById,
    updateNote,
    togglePin,
    deleteNote,
    reorderNotes,
    getNoteStats,
    uploadNoteImage
} = require("../controllers/stickyNoteController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// =========================
// STICKY NOTE ROUTES
// =========================

router.get("/stats", protect, getNoteStats);
router.get("/", protect, getMyNotes);
router.post("/", protect, createNote);
router.post("/reorder", protect, reorderNotes);
router.post("/upload-image", protect, upload.single("image"), uploadNoteImage);

router.get("/:id", protect, getNoteById);
router.put("/:id", protect, updateNote);
router.patch("/:id/pin", protect, togglePin);
router.delete("/:id", protect, deleteNote);

module.exports = router;
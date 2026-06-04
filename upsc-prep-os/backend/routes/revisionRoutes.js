const express = require("express");
const router = express.Router();

const {
    getDueRevisions,
    processRevision,
    getRevisionSummary,
    getRevisionWidget
} = require("../controllers/revisionController");

const { protect } = require("../middleware/authMiddleware");

// =========================
// REVISION ROUTES
// All routes require auth
// =========================

// Get batch of due questions for revision session
// Query: ?mode=GS&limit=20
router.get("/due", protect, getDueRevisions);

// Submit a revision answer (advance / reset / master)
// Body: { questionId, isCorrect, mode, timeTaken, selectedOption, mistakeCategory }
router.post("/process", protect, processRevision);

// Full revision page header data (stages, next due, etc.)
// Query: ?mode=GS
router.get("/summary", protect, getRevisionSummary);

// Tiny payload for dashboard widget
// Query: ?mode=GS
router.get("/widget", protect, getRevisionWidget);

module.exports = router;
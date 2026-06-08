const express = require("express");
const router = express.Router();

const {
    createTrack,
    getMyTrack,
    getTodayQuestions,
    getNextQuestion,
    submitAnswer,
    getFreePracticeQuestions    // ← ADD THIS
} = require("../controllers/preparationTrackController");

const { protect } = require("../middleware/authMiddleware");

// =========================
// FREE PRACTICE (no track needed)
// MUST come before /:something routes (none here, but good practice)
// =========================
router.get(
    "/free-practice",
    protect,
    getFreePracticeQuestions
);

// =========================
// CREATE TRACK
// =========================
router.post(
    "/create",
    protect,
    createTrack
);

// =========================
// ACTIVE TRACK
// =========================
router.get(
    "/me",
    protect,
    getMyTrack
);

// =========================
// TODAY QUESTIONS
// =========================
router.get(
    "/today",
    protect,
    getTodayQuestions
);

// =========================
// NEXT QUESTION
// =========================
router.get(
    "/next-question",
    protect,
    getNextQuestion
);

// =========================
// SUBMIT ANSWER
// =========================
router.post(
    "/submit-answer",
    protect,
    submitAnswer
);

module.exports = router;
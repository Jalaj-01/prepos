const express = require("express");

const router = express.Router();

const {

    toggleComplete,

    toggleBookmark,

    saveNotes,

    getMyBookmarked

} = require("../controllers/mainsAttemptController");

const {
    protect
} = require("../middleware/authMiddleware");

// =========================
// USER ACTIONS
// =========================

router.put(
    "/toggle/:questionId",
    protect,
    toggleComplete
);

router.put(
    "/bookmark/:questionId",
    protect,
    toggleBookmark
);

router.put(
    "/notes/:questionId",
    protect,
    saveNotes
);

router.get(
    "/bookmarked",
    protect,
    getMyBookmarked
);

module.exports = router;
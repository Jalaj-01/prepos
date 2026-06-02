const express = require("express");

const router = express.Router();

const {

    toggleBookmark,

    getBookmarkedQuestions,

    checkBookmarkStatus

} = require("../controllers/bookmarkController");

const {
    protect
} = require("../middleware/authMiddleware");

// =========================
// GET MY BOOKMARKS (any logged-in user)
// =========================

router.get(
    "/",
    protect,
    getBookmarkedQuestions
);

// =========================
// TOGGLE BOOKMARK (any logged-in user)
// =========================

router.put(
    "/:id",
    protect,
    toggleBookmark
);

// =========================
// CHECK BOOKMARK STATUS (bulk check)
// =========================

router.post(
    "/check",
    protect,
    checkBookmarkStatus
);

module.exports = router;
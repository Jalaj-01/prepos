const express =
    require('express');

const router =
    express.Router();

const {

    toggleBookmark,

    getBookmarkedQuestions

} = require(
    '../controllers/bookmarkController'
);

const {

    protect,
    admin

} = require(
    '../middleware/authMiddleware'
);

// =========================
// ROUTES
// =========================

// GET ALL BOOKMARKS

router.get(
    '/',
    protect,
    admin,
    getBookmarkedQuestions
);

// TOGGLE BOOKMARK

router.put(
    '/:id',
    protect,
    admin,
    toggleBookmark
);

module.exports = router;
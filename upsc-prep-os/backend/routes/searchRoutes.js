const express = require("express");

const router = express.Router();

const {
    searchQuestions
} = require("../controllers/searchController");

const {
    protect
} = require("../middleware/authMiddleware");

// =========================
// SEARCH
// (protect required so Done/New filter can read req.user._id)
// =========================

router.get(
    "/",
    protect,
    searchQuestions
);

module.exports = router;
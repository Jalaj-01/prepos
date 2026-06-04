const express = require("express");
const router = express.Router();

const {
    getTaxonomyTree,
    getProgress,
    toggleProgress,
    getStats,
} = require("../controllers/syllabusController");

const { protect } = require("../middleware/authMiddleware");

router.get("/tree", protect, getTaxonomyTree);
router.get("/progress", protect, getProgress);
router.post("/mark", protect, toggleProgress);
router.get("/stats", protect, getStats);

module.exports = router;
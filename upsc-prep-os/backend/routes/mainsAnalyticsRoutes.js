const express = require("express");

const router = express.Router();

const {

    getDashboardStats,

    getPaperProgress,

    getSubjectProgress,

    getTopicProgress,

    getRecentActivity

} = require("../controllers/mainsAnalyticsController");

const {
    protect
} = require("../middleware/authMiddleware");

router.get(
    "/dashboard",
    protect,
    getDashboardStats
);

router.get(
    "/papers",
    protect,
    getPaperProgress
);

router.get(
    "/subjects",
    protect,
    getSubjectProgress
);

router.get(
    "/topics",
    protect,
    getTopicProgress
);

router.get(
    "/recent",
    protect,
    getRecentActivity
);

module.exports = router;
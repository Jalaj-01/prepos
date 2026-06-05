const express = require("express");
const router = express.Router();

const {
    listNotifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, listNotifications);
router.get("/unread-count", protect, unreadCount);
router.patch("/:id/read", protect, markRead);
router.patch("/read-all", protect, markAllRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
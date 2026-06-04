const express = require("express");
const router = express.Router();

const {
    listPosts,
    createPost,
    deletePost,
    toggleUpvote,
    addReply,
    deleteReply,
    adminUpdate,
    unreadIndicator,
} = require("../controllers/feedbackController");

const { protect } = require("../middleware/authMiddleware");

router.get("/unread-indicator", protect, unreadIndicator);
router.get("/", protect, listPosts);
router.post("/", protect, createPost);
router.delete("/:id", protect, deletePost);
router.post("/:id/upvote", protect, toggleUpvote);
router.post("/:id/reply", protect, addReply);
router.delete("/:id/reply/:replyId", protect, deleteReply);
router.patch("/:id/admin", protect, adminUpdate);

module.exports = router;
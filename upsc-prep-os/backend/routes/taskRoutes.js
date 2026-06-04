const express = require("express");
const router = express.Router();

const {
    createTask,
    getMyTasks,
    getTaskById,
    updateTask,
    toggleComplete,
    toggleSubtask,
    deleteTask,
    reorderTasks,
    getTaskStats,
    getDueReminders,
    markReminderSent
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

// =========================
// TASK / PLANNER ROUTES
// =========================

router.get("/stats", protect, getTaskStats);
router.get("/reminders/due", protect, getDueReminders);
router.get("/", protect, getMyTasks);
router.post("/", protect, createTask);
router.post("/reorder", protect, reorderTasks);

router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.patch("/:id/toggle", protect, toggleComplete);
router.patch("/:id/reminder-sent", protect, markReminderSent);
router.patch("/:id/subtasks/:subtaskId/toggle", protect, toggleSubtask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
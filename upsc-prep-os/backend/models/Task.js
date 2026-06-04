const mongoose = require("mongoose");

// =========================
// SUBTASK SUB-SCHEMA
// =========================

const SubtaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, maxlength: 300 },
        done: { type: Boolean, default: false },
        order: { type: Number, default: 0 }
    },
    { _id: true }
);

// =========================
// TASK SCHEMA
// =========================

const TaskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            maxlength: 300
        },

        description: {
            type: String,
            default: "",
            maxlength: 5000
        },

        dueDate: {
            type: Date,
            default: null,
            index: true
        },

        // Optional time component (HH:mm) — stored separately so we can show "Today 5:30 PM"
        dueTime: {
            type: String, // "HH:mm" 24h
            default: null
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        category: {
            type: String,
            enum: ["prelims", "mains", "revision", "general"],
            default: "general"
        },

        status: {
            type: String,
            enum: ["pending", "in_progress", "done"],
            default: "pending",
            index: true
        },

        completedAt: {
            type: Date,
            default: null
        },

        // ========== SUBTASKS ==========
        subtasks: [SubtaskSchema],

        // ========== LINKED REFERENCE ==========
        linkedQuestion: {
            type: {
                type: String,
                enum: ["prelims", "mains", null],
                default: null
            },
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            }
        },

        // ========== RECURRENCE ==========
        recurrence: {
            type: {
                type: String,
                enum: ["none", "daily", "weekly", "monthly", "custom"],
                default: "none"
            },
            // For weekly: array of day numbers (0=Sun..6=Sat)
            // For monthly: day of month
            // For custom: every N days
            daysOfWeek: [{ type: Number, min: 0, max: 6 }],
            dayOfMonth: { type: Number, min: 1, max: 31, default: null },
            intervalDays: { type: Number, default: null },

            // Computed by cron — next time this task should auto-generate a new instance
            nextOccurrence: {
                type: Date,
                default: null,
                index: true
            }
        },

        // Parent task id if this is a generated instance from a recurring template
        recurrenceParentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null,
            index: true
        },

        // ========== REMINDERS ==========
        reminder: {
            enabled: { type: Boolean, default: false },
            // Minutes before due time to fire reminder
            minutesBefore: {
                type: Number,
                enum: [0, 5, 15, 30, 60, 120, 1440],
                default: 15
            },
            // Has the reminder already been sent for this instance?
            sent: { type: Boolean, default: false }
        },

        position: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// =========================
// INDEXES
// =========================
TaskSchema.index({ userId: 1, status: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, category: 1 });
TaskSchema.index({ userId: 1, dueDate: 1, status: 1 });
TaskSchema.index({ "recurrence.nextOccurrence": 1 });
TaskSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Task", TaskSchema);
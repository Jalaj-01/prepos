const cron = require("node-cron");

const Task = require("../models/Task");
const User = require("../models/User");

const { _helpers: taskHelpers } = require("../controllers/taskController");

const {
    sendEmail,
    streakReminderTemplate,
} = require("./emailService");

// ======================================================
// CONFIG
// ======================================================

const TIMEZONE = process.env.TZ || "Asia/Kolkata";

// ======================================================
// HELPERS
// ======================================================

const startOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

// ======================================================
// RECURRING TASK GENERATION JOB
// Runs daily at 12:05 AM
// ======================================================

const recurringTaskJob = async () => {
    try {
        const now = new Date();

        const templates = await Task.find({
            "recurrence.type": { $ne: "none" },
            "recurrence.nextOccurrence": { $lte: now },
        });

        let generatedCount = 0;

        for (const tpl of templates) {
            const occurrenceDate =
                tpl.recurrence.nextOccurrence;

            const dayStart = startOfDay(occurrenceDate);
            const dayEnd = new Date(
                dayStart.getTime() + 24 * 60 * 60 * 1000
            );

            const alreadyGenerated =
                await Task.findOne({
                    userId: tpl.userId,
                    recurrenceParentId: tpl._id,
                    dueDate: {
                        $gte: dayStart,
                        $lt: dayEnd,
                    },
                });

            if (!alreadyGenerated) {
                await Task.create({
                    userId: tpl.userId,
                    title: tpl.title,
                    description: tpl.description,
                    dueDate: occurrenceDate,
                    dueTime: tpl.dueTime,
                    priority: tpl.priority,
                    category: tpl.category,

                    subtasks: tpl.subtasks.map((subtask) => ({
                        title: subtask.title,
                        done: false,
                        order: subtask.order,
                    })),

                    linkedQuestion: tpl.linkedQuestion,

                    recurrence: {
                        type: "none",
                    },

                    recurrenceParentId: tpl._id,

                    reminder: {
                        enabled:
                            tpl.reminder?.enabled || false,
                        minutesBefore:
                            tpl.reminder?.minutesBefore || 15,
                        sent: false,
                    },
                });

                generatedCount++;
            }

            const nextOccurrence =
                taskHelpers.computeNextOccurrence(
                    tpl,
                    occurrenceDate
                );

            tpl.recurrence.nextOccurrence =
                nextOccurrence;

            await tpl.save();
        }

        console.log(
            `✅ Recurring task job completed. Generated ${generatedCount} tasks.`
        );
    } catch (error) {
        console.error(
            "❌ Recurring task job failed:",
            error
        );
    }
};

// ======================================================
// RESET REMINDER FLAGS JOB
// Runs daily at 12:10 AM
// ======================================================

const resetReminderFlagsJob = async () => {
    try {
        const now = new Date();

        const result = await Task.updateMany(
            {
                "reminder.enabled": true,
                "reminder.sent": true,
                dueDate: { $gt: now },
            },
            {
                $set: {
                    "reminder.sent": false,
                },
            }
        );

        console.log(
            `✅ Reminder flags reset. Modified: ${result.modifiedCount}`
        );
    } catch (error) {
        console.error(
            "❌ Reminder reset job failed:",
            error
        );
    }
};

// ======================================================
// STREAK REMINDER JOB
// Runs daily at 8:00 PM
// ======================================================

const streakReminderJob = async () => {
    try {
        console.log(
            "🔔 Running daily streak reminder job..."
        );

        const today = startOfDay();

        const users = await User.find({
            streak: { $gte: 1 },
            $or: [
                {
                    lastActiveDate: {
                        $lt: today,
                    },
                },
                {
                    lastActiveDate: null,
                },
            ],
        }).select(
            "name email streak dailyMcqTarget"
        );

        console.log(
            `📨 Found ${users.length} users to notify`
        );

        let sent = 0;
        let failed = 0;

        for (const user of users) {
            try {
                await sendEmail({
                    to: user.email,

                    subject: `🔥 Don't break your ${user.streak}-day streak!`,

                    html: streakReminderTemplate({
                        name:
                            user.name?.split(" ")[0] ||
                            "Aspirant",

                        currentStreak: user.streak,

                        dailyTarget:
                            user.dailyMcqTarget || 10,
                    }),
                });

                sent++;

                await sleep(200);
            } catch (error) {
                failed++;

                console.error(
                    `❌ Failed sending to ${user.email}:`,
                    error.message
                );
            }
        }

        console.log(
            `✅ Streak reminders completed. Sent: ${sent}, Failed: ${failed}`
        );
    } catch (error) {
        console.error(
            "❌ Streak reminder job failed:",
            error
        );
    }
};

// ======================================================
// MANUAL TEST HELPER
// ======================================================

const triggerStreakReminderNow = async () => {
    const today = startOfDay();

    const users = await User.find({
        streak: { $gte: 1 },
        $or: [
            {
                lastActiveDate: {
                    $lt: today,
                },
            },
            {
                lastActiveDate: null,
            },
        ],
    }).select(
        "name email streak dailyMcqTarget"
    );

    const results = {
        sent: 0,
        failed: 0,
        users: [],
    };

    for (const user of users) {
        try {
            await sendEmail({
                to: user.email,

                subject: `🔥 Don't break your ${user.streak}-day streak!`,

                html: streakReminderTemplate({
                    name:
                        user.name?.split(" ")[0] ||
                        "Aspirant",

                    currentStreak: user.streak,

                    dailyTarget:
                        user.dailyMcqTarget || 10,
                }),
            });

            results.sent++;

            results.users.push({
                email: user.email,
                status: "sent",
            });
        } catch (error) {
            results.failed++;

            results.users.push({
                email: user.email,
                status: "failed",
                error: error.message,
            });
        }
    }

    return results;
};

// ======================================================
// INITIALIZE ALL CRON JOBS
// ======================================================

const initCronJobs = () => {
    const enabled =
        process.env.NODE_ENV === "production" ||
        process.env.ENABLE_CRON === "true";

    if (!enabled) {
        console.log(
            "⏸️ Cron jobs disabled. Set ENABLE_CRON=true to enable."
        );
        return;
    }

    // Recurring task generation
    cron.schedule(
        "5 0 * * *",
        recurringTaskJob,
        { timezone: TIMEZONE }
    );

    // Reminder flag reset
    cron.schedule(
        "10 0 * * *",
        resetReminderFlagsJob,
        { timezone: TIMEZONE }
    );

    // Daily streak reminders
    cron.schedule(
        "0 20 * * *",
        streakReminderJob,
        { timezone: TIMEZONE }
    );

    console.log("✅ All cron jobs initialized");
    console.log(`🌍 Timezone: ${TIMEZONE}`);
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    initCronJobs,
    triggerStreakReminderNow,

    // optional exports for testing
    recurringTaskJob,
    resetReminderFlagsJob,
    streakReminderJob,
};
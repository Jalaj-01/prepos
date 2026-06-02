const cron = require("node-cron");

const User =
    require("../models/User");

const {
    sendEmail,
    streakReminderTemplate
} = require("./emailService");

// =========================
// DAILY STREAK REMINDER
// Runs every day at 8:00 PM (server time)
// =========================

const startStreakReminderJob = () => {

    // Format: '0 20 * * *' = Every day at 8 PM

    cron.schedule(
        "0 20 * * *",

        async () => {

            console.log(
                "🔔 Running daily streak reminder job..."
            );

            try {

                // Find users with active streaks (>= 1)
                // who haven't practiced today

                const today = new Date();

                today.setHours(0, 0, 0, 0);

                const users =
                    await User.find({

                        streak: { $gte: 1 },

                        $or: [
                            { lastActiveDate: { $lt: today } },
                            { lastActiveDate: null }
                        ]

                    }).select(
                        "name email streak dailyMcqTarget"
                    );

                console.log(
                    `📨 Sending reminders to ${users.length} users...`
                );

                let sent = 0;

                let failed = 0;

                for (const user of users) {

                    try {

                        await sendEmail({

                            to: user.email,

                            subject:
                                `🔥 Don't break your ${user.streak}-day streak!`,

                            html:
                                streakReminderTemplate({

                                    name:
                                        user.name.split(" ")[0],

                                    currentStreak:
                                        user.streak,

                                    dailyTarget:
                                        user.dailyMcqTarget || 10
                                })
                        });

                        sent++;

                        // Small delay to avoid rate limits

                        await new Promise(r =>
                            setTimeout(r, 200)
                        );

                    } catch (err) {

                        failed++;

                        console.error(
                            `Failed to email ${user.email}:`,
                            err.message
                        );
                    }
                }

                console.log(
                    `✅ Streak reminders: ${sent} sent, ${failed} failed`
                );

            } catch (err) {

                console.error(
                    "Streak reminder job error:",
                    err
                );
            }
        },

        {
            timezone:
                process.env.TZ || "Asia/Kolkata"
        }
    );

    console.log(
        "⏰ Daily streak reminder job scheduled (8:00 PM IST)"
    );
};

// =========================
// INIT ALL CRON JOBS
// =========================

exports.initCronJobs = () => {

    // Only run in production OR if explicitly enabled

    if (
        process.env.NODE_ENV === "production" ||
        process.env.ENABLE_CRON === "true"
    ) {

        startStreakReminderJob();

        console.log(
            "✅ Cron jobs initialized"
        );

    } else {

        console.log(
            "⏸️  Cron jobs disabled in dev (set ENABLE_CRON=true to enable)"
        );
    }
};

// =========================
// MANUAL TRIGGER (for testing)
// =========================

exports.triggerStreakReminderNow = async () => {

    console.log(
        "🧪 Manually triggering streak reminders..."
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const users =
        await User.find({

            streak: { $gte: 1 },

            $or: [
                { lastActiveDate: { $lt: today } },
                { lastActiveDate: null }
            ]

        }).select(
            "name email streak dailyMcqTarget"
        );

    const results = {
        sent: 0,
        failed: 0,
        users: []
    };

    for (const user of users) {

        try {

            await sendEmail({

                to: user.email,

                subject:
                    `🔥 Don't break your ${user.streak}-day streak!`,

                html:
                    streakReminderTemplate({

                        name:
                            user.name.split(" ")[0],

                        currentStreak:
                            user.streak,

                        dailyTarget:
                            user.dailyMcqTarget || 10
                    })
            });

            results.sent++;

            results.users.push({
                email: user.email,
                status: "sent"
            });

        } catch (err) {

            results.failed++;

            results.users.push({
                email: user.email,
                status: "failed",
                error: err.message
            });
        }
    }

    return results;
};
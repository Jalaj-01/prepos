const express = require("express");

const router = express.Router();

const {
    protect,
    admin
} = require("../middleware/authMiddleware");

const {
    triggerStreakReminderNow
} = require("../utils/cronJobs");

const {
    sendEmail,
    streakReminderTemplate,
    welcomeTemplate
} = require("../utils/emailService");

// =========================
// SEND TEST EMAIL TO ME
// (Best for testing — sends to YOUR email instantly)
// =========================

router.post(
    "/test-email-to-me",
    protect,
    async (req, res) => {

        try {

            const {
                type = "streak"
            } = req.body;

            const user = req.user;

            let result;

            if (type === "streak") {

                // Streak reminder email

                result =
                    await sendEmail({

                        to: user.email,

                        subject:
                            `🔥 [TEST] Don't break your streak!`,

                        html:
                            streakReminderTemplate({

                                name:
                                    user.name.split(" ")[0],

                                currentStreak:
                                    user.streak || 7,

                                dailyTarget:
                                    user.dailyMcqTarget || 10
                            })
                    });

            } else if (type === "welcome") {

                // Welcome email

                result =
                    await sendEmail({

                        to: user.email,

                        subject:
                            `🎉 [TEST] Welcome to PrepOS!`,

                        html:
                            welcomeTemplate({
                                name:
                                    user.name.split(" ")[0]
                            })
                    });

            } else {

                return res.status(400).json({
                    message:
                        "Invalid type. Use 'streak' or 'welcome'"
                });
            }

            if (result.success) {

                res.json({

                    message:
                        `✅ Test email sent to ${user.email}! Check your inbox (and spam folder).`,

                    type,

                    sentTo: user.email,

                    messageId: result.messageId
                });

            } else {

                res.status(500).json({

                    message:
                        "Failed to send email",

                    reason:
                        result.reason || result.error,

                    hint:
                        "Check EMAIL_USER and EMAIL_PASS in .env"
                });
            }

        } catch (err) {

            console.error(
                "Test email error:",
                err
            );

            res.status(500).json({
                message: err.message
            });
        }
    }
);

// =========================
// MANUALLY TRIGGER STREAK EMAILS
// (Sends to ALL eligible users — admin only)
// =========================

router.post(
    "/trigger-streak-emails",
    protect,
    admin,
    async (req, res) => {

        try {

            const results =
                await triggerStreakReminderNow();

            res.json({

                message:
                    `Emails: ${results.sent} sent, ${results.failed} failed`,

                ...results
            });

        } catch (err) {

            res.status(500).json({
                message: err.message
            });
        }
    }
);

// =========================
// CHECK EMAIL CONFIG
// =========================

router.get(
    "/check-email-config",
    protect,
    admin,
    async (req, res) => {

        const hasUser = !!process.env.EMAIL_USER;

        const hasPass = !!process.env.EMAIL_PASS;

        const hasFrontendUrl = !!process.env.FRONTEND_URL;

        res.json({

            configured:
                hasUser && hasPass,

            email_user:
                hasUser
                    ? process.env.EMAIL_USER
                    : "❌ NOT SET",

            email_pass:
                hasPass
                    ? "✅ Set (hidden)"
                    : "❌ NOT SET",

            frontend_url:
                hasFrontendUrl
                    ? process.env.FRONTEND_URL
                    : "❌ NOT SET (using fallback)",

            instructions:
                hasUser && hasPass
                    ? "Email is ready. Test with POST /api/admin-tools/test-email-to-me"
                    : "Add EMAIL_USER and EMAIL_PASS to .env file"
        });
    }
);

module.exports = router;
const express =
    require("express");

const router =
    express.Router();

const rateLimit =
    require("express-rate-limit");

const {

    sendEmail,

    contactFormTemplate,

    contactAutoReplyTemplate

} = require("../utils/emailService");

// =========================
// RATE LIMITER
// (Prevent spam — 3 messages per hour per IP)
// =========================

const contactLimiter =
    rateLimit({

        windowMs:
            60 * 60 * 1000,         // 1 hour

        max: 3,                      // 3 submissions per hour

        message: {

            success: false,

            message:
                "Too many messages. Please try again in 1 hour."
        },

        standardHeaders: true,

        legacyHeaders: false
    });

// =========================
// SUBMIT CONTACT FORM
// (Public — no auth needed)
// =========================

router.post(
    "/submit",

    contactLimiter,

    async (req, res) => {

        try {

            const {
                name,
                email,
                subject,
                message
            } = req.body;

            // =========================
            // VALIDATION
            // =========================

            if (!name || !name.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Name is required"
                });
            }

            if (!email || !email.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Email is required"
                });
            }

            // Basic email format check

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {

                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address"
                });
            }

            if (!message || !message.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Message is required"
                });
            }

            if (message.length < 10) {

                return res.status(400).json({
                    success: false,
                    message: "Message must be at least 10 characters"
                });
            }

            if (message.length > 5000) {

                return res.status(400).json({
                    success: false,
                    message: "Message too long (max 5000 characters)"
                });
            }

            // =========================
            // SEND EMAIL TO ADMIN
            // =========================

            const adminEmail =
                process.env.ADMIN_EMAIL ||
                process.env.EMAIL_USER;

            if (!adminEmail) {

                console.error(
                    "❌ ADMIN_EMAIL not set in .env"
                );

                return res.status(500).json({
                    success: false,
                    message: "Email system not configured"
                });
            }

            const subjectLabels = {
                general: "General Inquiry",
                support: "Technical Support",
                feedback: "Feedback",
                bug: "Bug Report",
                partnership: "Partnership",
                privacy: "Privacy Query"
            };

            const subjectLabel =
                subjectLabels[subject] || "General";

            const adminResult =
                await sendEmail({

                    to: adminEmail,

                    subject:
                        `[PrepOS Contact] ${subjectLabel} from ${name}`,

                    html:
                        contactFormTemplate({

                            name: name.trim(),

                            email: email.trim(),

                            subject:
                                subject || "general",

                            message: message.trim()
                        }),

                    text:
                        `New contact from ${name} (${email}):\n\n${message}`
                });

            if (!adminResult.success) {

                console.error(
                    "Failed to send admin email:",
                    adminResult
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to send message. Please try again later."
                });
            }

            // =========================
            // SEND AUTO-REPLY TO USER
            // (Don't fail if this errors)
            // =========================

            try {

                await sendEmail({

                    to: email.trim(),

                    subject:
                        "We got your message! - PrepOS Support",

                    html:
                        contactAutoReplyTemplate({
                            name: name.trim()
                        }),

                    text:
                        `Hi ${name},\n\nThanks for reaching out to PrepOS! We've received your message and will get back to you within 48 hours.`
                });

            } catch (autoReplyErr) {

                console.warn(
                    "Auto-reply failed (non-critical):",
                    autoReplyErr.message
                );
            }

            // =========================
            // SUCCESS
            // =========================

            console.log(
                `📬 Contact form: ${name} (${email}) — ${subjectLabel}`
            );

            res.status(200).json({

                success: true,

                message:
                    "Message sent successfully! We'll respond within 48 hours."
            });

        } catch (err) {

            console.error(
                "Contact form error:",
                err
            );

            res.status(500).json({

                success: false,

                message:
                    "Something went wrong. Please try again later."
            });
        }
    }
);

module.exports = router;
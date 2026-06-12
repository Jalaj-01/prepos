const nodemailer = require("nodemailer");

// =========================
// EMAIL TRANSPORTER
// (Cached, IPv4-forced for Render compatibility)
// =========================

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
    ) {
        console.warn(
            "⚠️ Email credentials not set in .env (EMAIL_USER, EMAIL_PASS)"
        );
        return null;
    }

    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        family: 4,                  // ← KEY FIX: force IPv4 (Render IPv6 routing fails)
        connectionTimeout: 10000,   // 10s connection timeout
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    return transporter;
};

// =========================
// SEND EMAIL
// =========================

exports.sendEmail = async (
    {
        to,
        subject,
        html,
        text
    }
) => {

    try {

        const t = getTransporter();

        if (!t) {

            console.warn(
                "Email skipped — no transporter"
            );

            return {
                success: false,
                reason: "no-credentials"
            };
        }

        const info =
            await t.sendMail({

                from:
                    `PrepOS <${process.env.EMAIL_USER}>`,

                to,

                subject,

                html,

                text:
                    text ||
                    subject
            });

        console.log(
            `📧 Email sent to ${to}: ${info.messageId}`
        );

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (err) {

        console.error(
            "Email send error:",
            err.message
        );

        return {
            success: false,
            error: err.message
        };
    }
};

// =========================
// EMAIL TEMPLATES
// =========================

exports.streakReminderTemplate = (
    {
        name,
        currentStreak,
        dailyTarget
    }
) => {

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Don't break your streak!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F5F5F4;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5F4; padding: 40px 20px;">

        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.04);">

                    <!-- HEADER -->

                    <tr>
                        <td style="background: linear-gradient(135deg, #FF6B35 0%, #F77F00 100%); padding: 40px; text-align: center;">

                            <div style="font-size: 60px; margin-bottom: 12px;">🔥</div>

                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">

                                Your Streak is at Risk!

                            </h1>

                        </td>
                    </tr>

                    <!-- BODY -->

                    <tr>
                        <td style="padding: 40px;">

                            <p style="color: #0A0A0A; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">

                                Hi ${name}, 👋

                            </p>

                            <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">

                                You haven't practiced today, and your <strong style="color: #FF6B35;">${currentStreak}-day streak</strong> is about to break.

                            </p>

                            <div style="background: #FFF7ED; border: 2px solid #FFEDD5; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">

                                <p style="color: #C2410C; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">

                                    Today's Target

                                </p>

                                <p style="color: #0A0A0A; font-size: 40px; font-weight: 900; margin: 0; line-height: 1;">

                                    ${dailyTarget} questions

                                </p>

                                <p style="color: #737373; font-size: 13px; margin: 8px 0 0 0;">

                                    Just 10-15 minutes of practice

                                </p>

                            </div>

                            <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 24px 0;">

                                Don't lose what you've built. Every UPSC topper says: <em>"Consistency beats intensity."</em>

                            </p>

                            <!-- CTA BUTTON -->

                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 32px auto;">
                                <tr>
                                    <td align="center" style="background: #0A0A0A; border-radius: 16px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/practice"
                                           style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 1.5px;">

                                            Practice Now →

                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #A3A3A3; font-size: 13px; text-align: center; margin: 24px 0 0 0;">

                                You've got this. Open the app and crush today's target.

                            </p>

                        </td>
                    </tr>

                    <!-- FOOTER -->

                    <tr>
                        <td style="background: #FAFAFA; padding: 24px; text-align: center; border-top: 1px solid #E7E5E4;">

                            <p style="color: #737373; font-size: 12px; margin: 0 0 8px 0;">

                                © ${new Date().getFullYear()} PrepOS. All rights reserved.

                            </p>

                            <p style="color: #A3A3A3; font-size: 11px; margin: 0;">

                                You're receiving this because you have an active streak.

                                <br>

                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" style="color: #6366F1; text-decoration: none;">

                                    Manage email preferences

                                </a>

                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>
    `;
};

// =========================
// WELCOME EMAIL TEMPLATE
// =========================

exports.welcomeTemplate = (
    {
        name
    }
) => {

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to PrepOS!</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F5F5F4;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5F4; padding: 40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden;">

                    <tr>
                        <td style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 40px; text-align: center;">
                            <div style="font-size: 60px; margin-bottom: 12px;">🎉</div>
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0;">
                                Welcome to PrepOS!
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px;">

                            <p style="color: #0A0A0A; font-size: 18px; font-weight: 700;">
                                Hi ${name}, 👋
                            </p>

                            <p style="color: #525252; font-size: 16px; line-height: 1.6;">
                                Welcome to your UPSC preparation journey! You now have access to:
                            </p>

                            <ul style="color: #525252; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                                <li>📚 <strong>Question Library</strong> — Years of PYQ data</li>
                                <li>📊 <strong>Smart Analytics</strong> — Track your weak areas</li>
                                <li>📁 <strong>My Vault</strong> — Personal study storage</li>
                                <li>🌍 <strong>Community Library</strong> — Notes shared by aspirants</li>
                            </ul>

                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 32px auto;">
                                <tr>
                                    <td align="center" style="background: #0A0A0A; border-radius: 16px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
                                           style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 900; font-size: 15px;">
                                            Get Started →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <tr>
                        <td style="background: #FAFAFA; padding: 24px; text-align: center;">
                            <p style="color: #737373; font-size: 12px;">
                                © ${new Date().getFullYear()} PrepOS
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
    `;
};

// =========================
// CONTACT FORM EMAIL TEMPLATE
// (Sent to admin when someone uses /contact)
// =========================

exports.contactFormTemplate = (
    {
        name,
        email,
        subject,
        message
    }
) => {

    const subjectLabels = {

        general: "💬 General Inquiry",
        support: "🔧 Technical Support",
        feedback: "💡 Feedback / Suggestion",
        bug: "🐛 Bug Report",
        partnership: "🤝 Partnership",
        privacy: "🔒 Privacy / Data"
    };

    const subjectLabel =
        subjectLabels[subject] || "💬 General";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F5F5F4;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5F4; padding: 40px 20px;">

        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.04);">

                    <!-- HEADER -->

                    <tr>
                        <td style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 32px 40px;">

                            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 50px; font-size: 11px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">

                                📬 New Contact Submission

                            </div>

                            <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">

                                ${subjectLabel}

                            </h1>

                        </td>
                    </tr>

                    <!-- BODY -->

                    <tr>
                        <td style="padding: 32px 40px;">

                            <!-- SENDER INFO -->

                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5F4; border-radius: 16px; padding: 20px; margin-bottom: 24px;">

                                <tr>
                                    <td>

                                        <div style="margin-bottom: 12px;">

                                            <p style="color: #737373; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">

                                                From

                                            </p>

                                            <p style="color: #0A0A0A; font-size: 16px; font-weight: 700; margin: 0;">

                                                ${name}

                                            </p>

                                        </div>

                                        <div>

                                            <p style="color: #737373; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">

                                                Email

                                            </p>

                                            <a href="mailto:${email}" style="color: #6366F1; font-size: 14px; font-weight: 700; text-decoration: none;">

                                                ${email}

                                            </a>

                                        </div>

                                    </td>
                                </tr>

                            </table>

                            <!-- MESSAGE -->

                            <p style="color: #737373; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">

                                Message

                            </p>

                            <div style="background: #ffffff; border: 2px solid #E7E5E4; border-radius: 16px; padding: 20px; margin-bottom: 24px;">

                                <p style="color: #0A0A0A; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>

                            </div>

                            <!-- QUICK REPLY -->

                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 24px auto;">
                                <tr>
                                    <td align="center" style="background: #0A0A0A; border-radius: 16px;">
                                        <a href="mailto:${email}?subject=Re:%20Your%20message%20to%20PrepOS"
                                           style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">

                                            Reply to ${name} →

                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #A3A3A3; font-size: 12px; text-align: center; margin: 16px 0 0 0;">

                                Received on ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}

                            </p>

                        </td>
                    </tr>

                    <!-- FOOTER -->

                    <tr>
                        <td style="background: #FAFAFA; padding: 24px; text-align: center; border-top: 1px solid #E7E5E4;">

                            <p style="color: #737373; font-size: 11px; margin: 0;">

                                This message was sent via the PrepOS contact form

                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>
    `;
};

// =========================
// AUTO-REPLY TEMPLATE
// (Sent to the user as confirmation)
// =========================

exports.contactAutoReplyTemplate = (
    {
        name
    }
) => {

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>We received your message!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F5F5F4;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5F4; padding: 40px 20px;">

        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.04);">

                    <tr>
                        <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px; text-align: center;">

                            <div style="font-size: 60px; margin-bottom: 12px;">✅</div>

                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">

                                We got your message!

                            </h1>

                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px;">

                            <p style="color: #0A0A0A; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">

                                Hi ${name}, 👋

                            </p>

                            <p style="color: #525252; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">

                                Thanks for reaching out to PrepOS! We've received your message and our team will get back to you within <strong>48 hours</strong>.

                            </p>

                            <p style="color: #525252; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">

                                In the meantime, feel free to continue exploring the platform. If your question is urgent, you can also check our documentation or community library.

                            </p>

                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 32px auto;">
                                <tr>
                                    <td align="center" style="background: #0A0A0A; border-radius: 16px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
                                           style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 1.5px;">

                                            Go to Dashboard →

                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #737373; font-size: 13px; text-align: center; margin: 24px 0 0 0;">

                                You don't need to reply to this email — it's automated.<br>

                                <strong>We'll respond to you personally soon!</strong>

                            </p>

                        </td>
                    </tr>

                    <tr>
                        <td style="background: #FAFAFA; padding: 24px; text-align: center; border-top: 1px solid #E7E5E4;">

                            <p style="color: #737373; font-size: 12px; margin: 0;">

                                © ${new Date().getFullYear()} PrepOS. All rights reserved.

                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>
    `;
};
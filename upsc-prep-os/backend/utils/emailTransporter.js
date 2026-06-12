const nodemailer = require("nodemailer");

let cachedTransporter = null;

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    cachedTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        family: 4, // Force IPv4 (Render IPv6 issue)
        connectionTimeout: 10000, // 10s timeout
        socketTimeout: 10000,
    });

    return cachedTransporter;
}

module.exports = { getTransporter };
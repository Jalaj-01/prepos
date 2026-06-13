/**
 * Strips HTML tags from string fields in req.body to prevent XSS.
 * Use on routes that accept user-generated content (feedback, notes, tasks, etc.)
 */
function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === "object") {
        const stripTags = (str) => {
            if (typeof str !== "string") return str;
            return str
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                .replace(/<[^>]*>/g, "")
                .trim();
        };

        const sanitizeObj = (obj) => {
            for (const key of Object.keys(obj)) {
                if (typeof obj[key] === "string") {
                    obj[key] = stripTags(obj[key]);
                } else if (
                    typeof obj[key] === "object" &&
                    obj[key] !== null &&
                    !Array.isArray(obj[key])
                ) {
                    sanitizeObj(obj[key]);
                }
            }
        };

        sanitizeObj(req.body);
    }
    next();
}

module.exports = { sanitizeBody };
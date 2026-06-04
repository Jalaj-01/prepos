// Only the configured SUPER_ADMIN_EMAIL can pass this gate.
// Used to lock down dangerous user-management endpoints.

const superAdmin = (req, res, next) => {
    const superEmail = (
        process.env.SUPER_ADMIN_EMAIL || ""
    )
        .toLowerCase()
        .trim();

    if (!superEmail) {
        return res.status(500).json({
            message:
                "SUPER_ADMIN_EMAIL is not configured on the server",
        });
    }

    if (
        !req.user ||
        (req.user.email || "").toLowerCase().trim() !== superEmail
    ) {
        return res.status(403).json({
            message: "Reserved for the super-administrator",
        });
    }

    next();
};

module.exports = { superAdmin };
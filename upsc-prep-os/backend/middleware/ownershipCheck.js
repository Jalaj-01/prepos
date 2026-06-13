/**
 * Middleware factory — verifies the logged-in user owns the requested resource.
 *
 * Usage in routes:
 *   router.get("/:id", protect, checkOwnership(Document, "uploadedBy"), getDocument);
 *   router.delete("/:id", protect, checkOwnership(Task, "userId"), deleteTask);
 *
 * @param {Model} Model - Mongoose model to look up
 * @param {string} ownerField - Field name that stores the user ID (e.g., "userId", "uploadedBy", "author")
 * @param {Object} options
 *   - adminBypass {boolean} - if true, admins can access any resource (default: false)
 *   - paramName {string} - req.params key to use (default: "id")
 */
function checkOwnership(Model, ownerField, options = {}) {
    const {
        adminBypass = false,
        paramName = "id",
    } = options;

    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];

            if (!resourceId) {
                return res
                    .status(400)
                    .json({ message: "Resource ID is required" });
            }

            const resource = await Model.findById(resourceId).lean();

            if (!resource) {
                return res
                    .status(404)
                    .json({ message: "Resource not found" });
            }

            // Admin bypass (optional — for admin endpoints)
            if (adminBypass && req.user?.isAdmin) {
                req.resource = resource;
                return next();
            }

            // Ownership check
            const ownerId = resource[ownerField];

            if (!ownerId) {
                return res
                    .status(500)
                    .json({ message: "Resource has no owner field" });
            }

            if (String(ownerId) !== String(req.user._id)) {
                return res
                    .status(403)
                    .json({ message: "You don't have permission to access this" });
            }

            // Attach resource to req so the controller doesn't need to re-fetch
            req.resource = resource;
            next();
        } catch (err) {
            console.error("Ownership check error:", err);
            return res
                .status(500)
                .json({ message: "Authorization check failed" });
        }
    };
}

module.exports = { checkOwnership };
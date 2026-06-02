const express =
    require("express");

const router =
    express.Router();

const b2Upload =
    require("../middleware/b2UploadMiddleware");

const {

    generateFileKey,

    uploadToB2,

    getSignedViewUrl,

    deleteFromB2

} = require("../utils/b2Helper");

const {

    canUserUpload,

    addStorageUsage,

    removeStorageUsage

} = require("../utils/storageManager");

const {
    protect
} = require("../middleware/authMiddleware");

// =========================
// TEST UPLOAD (WITH QUOTA CHECK)
// =========================

router.post(

    "/upload",

    protect,

    b2Upload.single("file"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    message: "No file uploaded"
                });
            }

            // =========================
            // CHECK QUOTA FIRST
            // =========================

            const quotaCheck =
                await canUserUpload(

                    req.user._id,

                    req.file.size
                );

            if (!quotaCheck.allowed) {

                return res.status(413).json({

                    message:
                        quotaCheck.reason,

                    storageInfo:
                        quotaCheck.currentUsage
                });
            }

            // =========================
            // UPLOAD TO B2
            // =========================

            const fileKey =
                generateFileKey(

                    req.user._id,

                    req.file.originalname,

                    "test"
                );

            await uploadToB2(

                req.file.buffer,

                fileKey,

                req.file.mimetype
            );

            // =========================
            // TRACK USAGE
            // =========================

            await addStorageUsage(

                req.user._id,

                req.file.size
            );

            const viewUrl =
                await getSignedViewUrl(
                    fileKey,
                    300
                );

            res.json({

                message:
                    "Upload successful",

                fileKey,

                fileSize:
                    req.file.size,

                viewUrl,

                expiresIn:
                    "5 minutes"
            });

        } catch (err) {

            console.error(
                "B2 Test Upload Error:",
                err
            );

            res.status(500).json({
                message: err.message
            });
        }
    }
);

// =========================
// TEST DELETE (UPDATES QUOTA)
// =========================

router.delete(

    "/:key",

    protect,

    async (req, res) => {

        try {

            const {
                size
            } = req.query;

            await deleteFromB2(
                req.params.key
            );

            if (size) {

                await removeStorageUsage(

                    req.user._id,

                    parseInt(size)
                );
            }

            res.json({
                message: "Deleted"
            });

        } catch (err) {

            res.status(500).json({
                message: err.message
            });
        }
    }
);

module.exports = router;
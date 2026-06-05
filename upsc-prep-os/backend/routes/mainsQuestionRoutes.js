const express = require("express");

const router = express.Router();

const {
    createQuestion,
    bulkCreate,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getFiltersMetadata,
    bulkDelete                  // ← NEW
} = require("../controllers/mainsQuestionController");

const {
    protect,
    admin
} = require("../middleware/authMiddleware");

// =========================
// PUBLIC (authenticated)
// =========================

router.get(
    "/",
    protect,
    getAllQuestions
);

router.get(
    "/filters/metadata",
    protect,
    getFiltersMetadata
);

// =========================
// ADMIN — bulk operations FIRST (before /:id)
// =========================

router.post(
    "/bulk",
    protect,
    admin,
    bulkCreate
);

router.post(
    "/bulk-delete",
    protect,
    admin,
    bulkDelete
);

// =========================
// PUBLIC (authenticated)
// =========================

router.get(
    "/:id",
    protect,
    getQuestionById
);

// =========================
// ADMIN ONLY — single-item operations
// =========================

router.post(
    "/",
    protect,
    admin,
    createQuestion
);

router.put(
    "/:id",
    protect,
    admin,
    updateQuestion
);

router.delete(
    "/:id",
    protect,
    admin,
    deleteQuestion
);

module.exports = router;
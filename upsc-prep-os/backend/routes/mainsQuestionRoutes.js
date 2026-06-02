const express = require("express");

const router = express.Router();

const {

    createQuestion,

    bulkCreate,

    getAllQuestions,

    getQuestionById,

    updateQuestion,

    deleteQuestion,

    getFiltersMetadata

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

router.get(
    "/:id",
    protect,
    getQuestionById
);

// =========================
// ADMIN ONLY
// =========================

router.post(
    "/",
    protect,
    admin,
    createQuestion
);

router.post(
    "/bulk",
    protect,
    admin,
    bulkCreate
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
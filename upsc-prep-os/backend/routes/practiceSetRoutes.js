const express =
    require("express");

const router =
    express.Router();

const {

    createPracticeSet,
    getPracticeSets,
    deletePracticeSet

} = require(
    "../controllers/practiceSetController"
);

const {

    protect

} = require(
    "../middleware/authMiddleware"
);

// =========================
// ROUTES
// =========================

router.post(
    "/",
    protect,
    createPracticeSet
);

router.get(
    "/",
    protect,
    getPracticeSets
);

router.delete(
    "/:id",
    protect,
    deletePracticeSet
);

module.exports =
    router;
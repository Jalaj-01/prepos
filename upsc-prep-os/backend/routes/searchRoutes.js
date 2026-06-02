const express =
    require("express");

const router =
    express.Router();

const {

    searchQuestions

} = require(
    "../controllers/searchController"
);

// =========================
// SEARCH
// =========================

router.get(
    "/",
    searchQuestions
);

module.exports =
    router;
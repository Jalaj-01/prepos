const express =
    require("express");

const router =
    express.Router();

const {

    createTrack,
    getMyTrack,
    getTodayQuestions,
    getNextQuestion,
    submitAnswer

} = require(

    "../controllers/preparationTrackController"
);

const {

    protect

} = require(

    "../middleware/authMiddleware"
);

// =========================
// CREATE TRACK
// =========================

router.post(

    "/create",

    protect,

    createTrack
);

// =========================
// ACTIVE TRACK
// =========================

router.get(

    "/me",

    protect,

    getMyTrack
);

// =========================
// TODAY QUESTIONS
// =========================

router.get(

    "/today",

    protect,

    getTodayQuestions
);

// =========================
// NEXT QUESTION
// =========================

router.get(

    "/next-question",

    protect,

    getNextQuestion
);

// =========================
// SUBMIT ANSWER
// =========================

router.post(

    "/submit-answer",

    protect,

    submitAnswer
);

module.exports =
    router;
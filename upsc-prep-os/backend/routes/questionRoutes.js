const express = require('express');

const router = express.Router();


const {
    createQuestion,
    getQuestionsByTopic,
    getDailyQuestions,
    addBulkQuestions,
    getQuestionsByReviewStatus,
    updateReviewStatus,
    exploreQuestions,
    
} = require('../controllers/questionController');

const {
    protect,
    admin
} = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');


// =========================
// CREATE SINGLE QUESTION
// Supports image upload
// =========================

router.post(
    '/add',
    protect,
    admin,
    upload.array('images', 10),
    createQuestion
);


// =========================
// BULK QUESTIONS
// =========================

router.post(
    '/bulk',
    protect,
    admin,
    addBulkQuestions
);


// =========================
// QUESTIONS BY TOPIC
// =========================

router.get(
    '/topic/:topicId',
    getQuestionsByTopic
);


// =========================
// DAILY RANDOM QUESTIONS
// =========================

router.get(
    '/daily',
    protect,
    getDailyQuestions
);

router.get('/review', protect, admin, getQuestionsByReviewStatus);

router.put(
    '/review/:id',
    protect,
    admin,
    updateReviewStatus
);

router.get(
    '/explore',
    exploreQuestions
);
module.exports = router;
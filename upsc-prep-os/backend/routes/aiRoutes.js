const express = require('express');

const router = express.Router();

const {
    classifyQuestion,
    generateExplanation
} = require('../controllers/aiController');

const {
    protect,
    admin
} = require('../middleware/authMiddleware');


// =========================
// AI QUESTION CLASSIFICATION
// =========================

router.post(
    '/classify',
    protect,
    admin,
    classifyQuestion
);


// =========================
// AI EXPLANATION GENERATION
// =========================

router.post(
    '/generate-explanation',
    protect,
    admin,
    generateExplanation
);


module.exports = router;
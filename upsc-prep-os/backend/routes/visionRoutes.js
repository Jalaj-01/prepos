const express = require('express');

const router = express.Router();

const {
    extractQuestionsFromImage,
    extractQuestionsFromText,
    extractQuestionsFromPages
} = require('../controllers/visionController');

const {
    protect,
    admin
} = require('../middleware/authMiddleware');

// Extract from single image

router.post(
    '/extract',
    protect,
    admin,
    extractQuestionsFromImage
);

// Extract from raw text (NEW)

router.post(
    '/extract-text',
    protect,
    admin,
    extractQuestionsFromText
);

// Extract from multiple PDF pages (NEW)

router.post(
    '/extract-pages',
    protect,
    admin,
    extractQuestionsFromPages
);

module.exports = router;
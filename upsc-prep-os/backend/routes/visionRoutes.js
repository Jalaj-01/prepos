const express = require('express');

const router = express.Router();

const {
    extractQuestionsFromImage
} = require('../controllers/visionController');

const {
    protect,
    admin
} = require('../middleware/authMiddleware');

router.post(
    '/extract',
    protect,
    admin,
    extractQuestionsFromImage
);

module.exports = router;
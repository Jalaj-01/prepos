const express = require('express');
const router = express.Router();
const { createQuestion, getQuestionsByTopic, getDailyQuestions } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Only Admins can add questions
router.post('/add', protect, admin, createQuestion);

router.get('/topic/:topicId', getQuestionsByTopic);
router.get('/daily', protect, getDailyQuestions);

module.exports = router;
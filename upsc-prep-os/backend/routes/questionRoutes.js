const express = require('express');
const router = express.Router();
const { createQuestion, getQuestionsByTopic, getDailyQuestions,addBulkQuestions  } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Only Admins can add questions
router.post('/add', protect, admin, createQuestion);

router.get('/topic/:topicId', getQuestionsByTopic);
router.get('/daily', protect, getDailyQuestions);
router.post('/bulk', protect, admin, addBulkQuestions);

module.exports = router;
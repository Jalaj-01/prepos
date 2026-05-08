const express = require('express');
const router = express.Router();
const { 
    createQuestion, 
    getQuestionsByTopic, 
    getDailyQuestions, 
    addBulkQuestions 
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/add', protect, admin, createQuestion);
router.post('/bulk', protect, admin, addBulkQuestions); // This line is now safe
router.get('/topic/:topicId', getQuestionsByTopic);
router.get('/daily', protect, getDailyQuestions);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
    logAttempt,
    getUserStats,
    getQuestionStatusMap     // ← NEW
} = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.post('/log', protect, logAttempt);
router.get('/stats', protect, getUserStats);

// NEW — fetch attempted status for a batch of question IDs
router.post('/status-map', protect, getQuestionStatusMap);

module.exports = router;
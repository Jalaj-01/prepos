const express = require('express');
const router = express.Router();
const { logAttempt, getUserStats } = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.post('/log', protect, logAttempt);
router.get('/stats', protect, getUserStats);

module.exports = router;
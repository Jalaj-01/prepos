const express = require('express');
const router = express.Router();
const {
    getDashboardAnalytics,
    getCompletionBreakdown,
    getWeakAreaIntelligence,
    getSmartRecommendations,
    getUnifiedDashboard
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/completion-breakdown', protect, getCompletionBreakdown);
router.get('/weak-area-intelligence', protect, getWeakAreaIntelligence);
router.get('/smart-recommendations', protect, getSmartRecommendations);
router.get('/unified-dashboard', protect, getUnifiedDashboard);

module.exports = router;
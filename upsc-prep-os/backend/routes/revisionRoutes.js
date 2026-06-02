const express = require('express');
const router = express.Router();
const { getDueRevisions, processRevisionResult, getRevisionDashboard, getRevisionQueue } = require('../controllers/revisionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/due', protect, getDueRevisions);
router.post('/complete', protect, processRevisionResult);
router.get('/dashboard', protect, getRevisionDashboard);
router.get('/queue', protect, getRevisionQueue);

module.exports = router;
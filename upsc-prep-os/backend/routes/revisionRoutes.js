const express = require('express');
const router = express.Router();
const { getDueRevisions, processRevisionResult } = require('../controllers/revisionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/due', protect, getDueRevisions);
router.post('/complete', protect, processRevisionResult);

module.exports = router;
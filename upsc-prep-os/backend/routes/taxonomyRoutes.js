const express = require('express');
const router = express.Router();
const { createTaxonomy, getTaxonomy, deleteTaxonomy } = require('../controllers/taxonomyController');
// FIX: Destructure protect and admin from the middleware object
const { protect, admin } = require('../middleware/authMiddleware');

// Only admins can create or delete subjects/topics
router.post('/', protect, admin, createTaxonomy);
router.delete('/:id', protect, admin, deleteTaxonomy);

// Everyone can view the taxonomy
router.get('/', getTaxonomy);

module.exports = router;
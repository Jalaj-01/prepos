const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// This is the line that was crashing - now fixed
router.put('/profile', protect, updateProfile); 

module.exports = router;
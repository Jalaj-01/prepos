const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    googleLogin, 
    forgotPasswordOTP, 
    resetPasswordWithOTP, 
    updateProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Standard Auth Routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth Route
router.post('/google', googleLogin);

// Password Reset Routes (OTP Based)
router.post('/forgot-password', forgotPasswordOTP);
router.post('/reset-password', resetPasswordWithOTP);

// Profile Update Route
router.put('/profile', protect, updateProfile); 

module.exports = router;
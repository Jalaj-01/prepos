const express = require('express');

const router = express.Router();

const {
    register,
    login,
    googleLogin,
    forgotPasswordOTP,
    resetPasswordWithOTP,
    updateProfile,
    getProfile,
    updateName,
    changePassword,
    deleteAccount
} = require('../controllers/authController');

const {
    protect
} = require('../middleware/authMiddleware');

// =========================
// AUTH ROUTES
// =========================

// Register & Login

router.post('/register', register);

router.post('/login', login);

// Google OAuth

router.post('/google', googleLogin);

// Password Reset (OTP)

router.post('/forgot-password', forgotPasswordOTP);

router.post('/reset-password', resetPasswordWithOTP);

// =========================
// PROFILE ROUTES (Protected)
// =========================

// Get full profile

router.get('/profile', protect, getProfile);

// Update target date

router.put('/profile', protect, updateProfile);

// Update name

router.put('/update-name', protect, updateName);

// Change password

router.put('/change-password', protect, changePassword);

// Delete account

router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
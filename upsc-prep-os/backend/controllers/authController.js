const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// @desc    Register a new user
exports.register = async (req, res) => {
    console.log("📥 New Registration Attempt:", req.body.email);
    try {
        const { name, email, password, targetCompletionDate } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log("❌ User already exists");
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Smart Planner Logic
        const totalPYQs = 5000; 
        const today = new Date();
        const target = new Date(targetCompletionDate);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const suggestedDailyTarget = diffDays > 0 ? Math.ceil(totalPYQs / diffDays) : 10;

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            targetCompletionDate,
            dailyMcqTarget: suggestedDailyTarget
        });

        console.log("✅ User Registered Successfully:", user.email);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            dailyMcqTarget: user.dailyMcqTarget,
            targetCompletionDate: user.targetCompletionDate,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("🔥 Registration Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
exports.login = async (req, res) => {
    console.log("📥 Login Attempt:", req.body.email);
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log("✅ Login Successful");
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                dailyMcqTarget: user.dailyMcqTarget,
                targetCompletionDate: user.targetCompletionDate,
                token: generateToken(user._id)
            });
        } else {
            console.log("❌ Invalid Credentials");
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("🔥 Login Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Target Date/Profile
exports.updateProfile = async (req, res) => {
    console.log("📥 Profile Update Request for:", req.user._id);
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { targetCompletionDate } = req.body;
        
        if (targetCompletionDate) {
            user.targetCompletionDate = targetCompletionDate;
            const totalPYQs = 5000; 
            const today = new Date();
            const target = new Date(targetCompletionDate);
            const diffDays = Math.ceil(Math.abs(target - today) / (1000 * 60 * 60 * 24));
            user.dailyMcqTarget = diffDays > 0 ? Math.ceil(totalPYQs / diffDays) : 10;
        }

        const updatedUser = await user.save();
        console.log("✅ Profile Updated");

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            dailyMcqTarget: updatedUser.dailyMcqTarget,
            targetCompletionDate: updatedUser.targetCompletionDate,
            token: req.headers.authorization.split(' ')[1] 
        });
    } catch (error) {
        console.error("🔥 Update Profile Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// --- GOOGLE OAUTH ---
exports.googleLogin = async (req, res) => {
    const { token, targetCompletionDate } = req.body; // targetCompletionDate passed from frontend signup
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Smart Planner Logic for new Google user
            const totalPYQs = 5000; 
            const today = new Date();
            // If date isn't provided (e.g. login instead of signup), fallback to 1 year
            const target = new Date(targetCompletionDate || Date.now() + 31536000000); 
            const diffDays = Math.ceil(Math.abs(target - today) / (1000 * 60 * 60 * 24));
            const suggestedDailyTarget = diffDays > 0 ? Math.ceil(totalPYQs / diffDays) : 10;

            user = await User.create({
                name, 
                email, 
                googleId, 
                authProvider: 'google',
                targetCompletionDate: target,
                dailyMcqTarget: suggestedDailyTarget
            });
            console.log("✅ New Google User Created with Target:", suggestedDailyTarget);
        }

        res.json({
            _id: user._id, 
            name: user.name, 
            email: user.email,
            isAdmin: user.isAdmin, 
            dailyMcqTarget: user.dailyMcqTarget,
            targetCompletionDate: user.targetCompletionDate,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("🔥 Google Auth Error:", error.message);
        res.status(400).json({ message: "Google Authentication failed" });
    }
};

// --- FORGOT PASSWORD (OTP) ---
exports.forgotPasswordOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            to: user.email,
            subject: 'PrepOS - Your Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
        });

        res.json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- RESET PASSWORD WITH OTP ---
exports.resetPasswordWithOTP = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordOTPExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;
        user.authProvider = 'local'; 
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================
// GET FULL PROFILE
// =========================

exports.getProfile = async (req, res) => {

    try {

        const user =
            await User.findById(req.user._id)
                .select("-password -resetPasswordOTP -resetPasswordOTPExpire");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {

        console.error("Get Profile Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// UPDATE NAME
// =========================

exports.updateName = async (req, res) => {

    try {

        const { name } = req.body;

        if (!name || !name.trim()) {

            return res.status(400).json({
                message: "Name is required"
            });
        }

        const user =
            await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }

        user.name = name.trim();

        await user.save();

        console.log("✅ Name updated for:", user.email);

        res.json({

            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            dailyMcqTarget: user.dailyMcqTarget,
            targetCompletionDate: user.targetCompletionDate,
            streak: user.streak,
            token: req.headers.authorization.split(' ')[1]
        });

    } catch (error) {

        console.error("Update Name Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// CHANGE PASSWORD (while logged in)
// =========================

exports.changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {

            return res.status(400).json({
                message: "Both current and new password are required"
            });
        }

        if (newPassword.length < 6) {

            return res.status(400).json({
                message: "New password must be at least 6 characters"
            });
        }

        const user =
            await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }

        // Google users can't change password

        if (user.authProvider === 'google' && !user.password) {

            return res.status(400).json({
                message: "Google accounts don't have a password. Use Google to sign in."
            });
        }

        // Verify current password

        const isMatch =
            await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {

            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        // Hash new password

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        console.log("✅ Password changed for:", user.email);

        res.json({
            message: "Password changed successfully"
        });

    } catch (error) {

        console.error("Change Password Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
};

// =========================
// DELETE ACCOUNT
// =========================

exports.deleteAccount = async (req, res) => {

    try {

        const {
            confirmText
        } = req.body;

        // Safety check

        if (confirmText !== "DELETE MY ACCOUNT") {

            return res.status(400).json({
                message: "Please type 'DELETE MY ACCOUNT' to confirm"
            });
        }

        const userId = req.user._id;

        // Delete user's data from related collections

        const Attempt = require('../models/Attempt');
        const Document = require('../models/Document');
        const Folder = require('../models/Folder');
        const MainsAttempt = require('../models/MainsAttempt');
        const PreparationTrack = require('../models/PreparationTrack');

        // Delete in parallel

        await Promise.all([

            Attempt.deleteMany({ userId }),
            Document.deleteMany({ uploadedBy: userId }),
            Folder.deleteMany({ userId }),
            MainsAttempt.deleteMany({ userId }),
            PreparationTrack.deleteMany({ userId })
        ]);

        // Finally delete user

        await User.findByIdAndDelete(userId);

        console.log("⚠️ Account deleted:", userId);

        res.json({
            message: "Account deleted permanently"
        });

    } catch (error) {

        console.error("Delete Account Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
};
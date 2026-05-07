const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// @desc    Register a new user
exports.register = async (req, res) => {
    console.log("📥 New Registration Attempt:", req.body.email);
    try {
        const { name, email, password, targetCompletionDate } = req.body;

        // 1. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log("❌ User already exists");
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Calculate Daily MCQ Target (Smart Planner)
        const totalPYQs = 5000; 
        const today = new Date();
        const target = new Date(targetCompletionDate);
        
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const suggestedDailyTarget = diffDays > 0 ? Math.ceil(totalPYQs / diffDays) : 10;

        // 4. Create User
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
            
            // Recalculate daily target based on new date
            const totalPYQs = 5000; 
            const today = new Date();
            const target = new Date(targetCompletionDate);
            const diffDays = Math.ceil(Math.abs(target - today) / (1000 * 60 * 60 * 24));
            user.dailyMcqTarget = diffDays > 0 ? Math.ceil(totalPYQs / diffDays) : 10;
        }

        const updatedUser = await user.save();
        
        console.log("✅ Profile Updated. New daily target:", updatedUser.dailyMcqTarget);

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin, // Included so frontend keeps admin status
            dailyMcqTarget: updatedUser.dailyMcqTarget,
            targetCompletionDate: updatedUser.targetCompletionDate,
            token: req.headers.authorization.split(' ')[1] // Return the existing token
        });
    } catch (error) {
        console.error("🔥 Update Profile Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};
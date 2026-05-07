const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

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
        
        // Calculate difference in days
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Fallback to 10 if date is invalid or too close
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
            dailyMcqTarget: user.dailyMcqTarget,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("🔥 Registration Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

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
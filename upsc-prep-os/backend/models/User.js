const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Admin Control
    isAdmin: { type: Boolean, default: false }, // Default is false

    targetExamYear: { type: Number, default: 2026 },
    platformJoiningDate: { type: Date, default: Date.now },
    targetCompletionDate: { type: Date },
    dailyMcqTarget: { type: Number, default: 10 },
    
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    upscReadinessScore: { type: Number, default: 0 },
    
    totalQuestionsSolved: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
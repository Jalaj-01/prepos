const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Password is only required if authProvider is 'local'
    password: { 
        type: String, 
        required: function() { return this.authProvider === 'local'; } 
    },
    
    // Auth Customizations
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, unique: true, sparse: true },

    // OTP Password Reset
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,
    
    // Admin Control
    isAdmin: { type: Boolean, default: false },

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
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

    isDeleted: {
    type: Boolean,
    default: false,
    index: true
},

deletedAt: {
    type: Date,
    default: null
},

    targetExamYear: { type: Number, default: 2026 },
    platformJoiningDate: { type: Date, default: Date.now },
    targetCompletionDate: { type: Date },
    dailyMcqTarget: { type: Number, default: 10 },

    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    upscReadinessScore: { type: Number, default: 0 },

    totalQuestionsSolved: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 },

    bookmarkedQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],

    // =========================
    // STORAGE QUOTA SYSTEM
    // =========================

    storageUsedBytes: {
        type: Number,
        default: 0
    },

    storageQuotaBytes: {
        type: Number,
        default: 100 * 1024 * 1024     // 100 MB default
    },

    userTier: {
        type: String,
        enum: ['free', 'verified', 'premium', 'admin'],
        default: 'free'
    }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
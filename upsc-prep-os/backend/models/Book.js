const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    author: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxonomy', default: null },
    totalPages: { type: Number, required: true, default: 0 },
    currentPage: { type: Number, default: 0 }, // This stores the % completion
    
    chapters: [{
        name: { type: String, required: true },
        status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'Revision Pending'], default: 'Not Started' },
        confidenceLevel: { type: String, enum: ['Strong', 'Moderate', 'Weak'], default: 'Moderate' },
        revisionCount: { type: Number, default: 0 }, // Added this
        topics: [{
            name: { type: String },
            isCompleted: { type: Boolean, default: false }
        }]
    }],
    
    readingStreak: { type: Number, default: 0 },
    lastReadAt: { type: Date },
    targetFinishDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
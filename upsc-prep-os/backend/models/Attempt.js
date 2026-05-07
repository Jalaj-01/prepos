const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    isCorrect: { type: Boolean, required: true },
    selectedOption: { type: String },
    timeTaken: { type: Number },
    mistakeCategory: { 
        type: String, 
        enum: ['None', 'Conceptual', 'Factual Confusion', 'Silly Mistake', 'Guessing', 'Elimination Failure', 'Time Pressure'],
        default: 'None'
    },
    nextRevisionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
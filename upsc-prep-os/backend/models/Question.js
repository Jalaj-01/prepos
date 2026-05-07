const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{
        label: { type: String, required: true }, // A, B, C, D
        text: { type: String, required: true }
    }],
    correctOption: { type: String, required: true },
    explanation: { type: String },
    
    // Metadata
    year: { type: Number, required: true },
    examType: { type: String, enum: ['Prelims', 'Mains'], default: 'Prelims' },
    paper: { type: String, default: 'GS1' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    
    // IDs linking to Subject/Topic
    taxonomyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Taxonomy' }], 
    tags: [String],
    isRepeatedConcept: { type: Boolean, default: false },
    timeEstimate: { type: Number, default: 90 }, 
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
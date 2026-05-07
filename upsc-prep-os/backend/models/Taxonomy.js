const mongoose = require('mongoose');

const TaxonomySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    level: { 
        type: String, 
        enum: ['subject', 'topic', 'subtopic'], 
        required: true 
    },
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Taxonomy', 
        default: null 
    },
    description: { 
        type: String 
    }
}, { timestamps: true });

// Crucial: This exports the model so .create() and .find() work
module.exports = mongoose.model('Taxonomy', TaxonomySchema);
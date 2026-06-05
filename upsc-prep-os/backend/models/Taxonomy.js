const mongoose = require('mongoose');

const TaxonomySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true,
        unique: true
    },

    level: {
        type: String,
        enum: [
            'subject',
            'topic',
            'subtopic'
        ],
        required: true
    },

    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Taxonomy',
        default: null
    },

    description: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});

// =========================
// INDEXES
// =========================

TaxonomySchema.index({
    level: 1
});

TaxonomySchema.index({
    parentId: 1
});

// TaxonomySchema.index({
//     slug: 1
// });

// =========================
// EXPORT
// =========================

module.exports =
    mongoose.model(
        'Taxonomy',
        TaxonomySchema
    );
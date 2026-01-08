const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    assetId: {
        type: String,
        required: true
    },
    assignmentDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'returned', 'pending'],
        default: 'active'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
assignmentSchema.index({ userId: 1 });
assignmentSchema.index({ assetId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);

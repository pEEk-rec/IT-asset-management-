const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    assetId: {
        type: String,
        unique: true,
        required: true
    },
    assetName: {
        type: String,
        required: true
    },
    assetType: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        unique: true,
        required: true
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    warranty: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'assigned', 'maintenance', 'retired'],
        default: 'available'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);

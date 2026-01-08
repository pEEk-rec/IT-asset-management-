const Asset = require('../models/Asset');

// Get all assets
exports.getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.find().sort({ createdAt: -1 });
        res.json(assets);
    } catch (error) {
        console.error('Get all assets error:', error);
        res.status(500).json({ error: 'Server error fetching assets' });
    }
};

// Get asset by ID
exports.getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        res.json(asset);
    } catch (error) {
        console.error('Get asset by ID error:', error);
        res.status(500).json({ error: 'Server error fetching asset' });
    }
};

// Create new asset
exports.createAsset = async (req, res) => {
    try {
        const { assetId, assetName, assetType, model, serialNumber, purchaseDate, warranty, location } = req.body;

        // Check if asset with same assetId or serialNumber exists
        const existingAsset = await Asset.findOne({
            $or: [{ assetId }, { serialNumber }]
        });

        if (existingAsset) {
            return res.status(400).json({
                error: 'Asset with this ID or Serial Number already exists'
            });
        }

        const asset = new Asset({
            assetId,
            assetName,
            assetType,
            model,
            serialNumber,
            purchaseDate,
            warranty,
            location,
            status: 'available'
        });

        await asset.save();
        res.status(201).json(asset);
    } catch (error) {
        console.error('Create asset error:', error);
        res.status(500).json({ error: 'Server error creating asset' });
    }
};

// Update asset
exports.updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        res.json(asset);
    } catch (error) {
        console.error('Update asset error:', error);
        res.status(500).json({ error: 'Server error updating asset' });
    }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);

        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        res.json({ message: 'Asset deleted successfully', asset });
    } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({ error: 'Server error deleting asset' });
    }
};

// Get assets by status
exports.getAssetsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const assets = await Asset.find({ status }).sort({ createdAt: -1 });
        res.json(assets);
    } catch (error) {
        console.error('Get assets by status error:', error);
        res.status(500).json({ error: 'Server error fetching assets' });
    }
};

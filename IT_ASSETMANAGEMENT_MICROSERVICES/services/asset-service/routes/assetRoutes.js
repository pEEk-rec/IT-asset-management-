const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

// GET /assets - Get all assets
router.get('/', assetController.getAllAssets);

// GET /assets/:id - Get asset by ID
router.get('/:id', assetController.getAssetById);

// POST /assets - Create new asset
router.post('/', assetController.createAsset);

// PUT /assets/:id - Update asset
router.put('/:id', assetController.updateAsset);

// DELETE /assets/:id - Delete asset
router.delete('/:id', assetController.deleteAsset);

// GET /assets/status/:status - Get assets by status
router.get('/status/:status', assetController.getAssetsByStatus);

module.exports = router;

const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5103';

// Get all assignments
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        console.error('Get all assignments error:', error);
        res.status(500).json({ error: 'Server error fetching assignments' });
    }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json(assignment);
    } catch (error) {
        console.error('Get assignment by ID error:', error);
        res.status(500).json({ error: 'Server error fetching assignment' });
    }
};

// Create new assignment (with user validation via User Service)
exports.createAssignment = async (req, res) => {
    try {
        const { userId, assetId, assignmentDate, notes } = req.body;

        // 1. Verify asset exists and is available
        const asset = await Asset.findOne({ assetId });
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        if (asset.status === 'assigned') {
            return res.status(400).json({ error: 'Asset is already assigned' });
        }

        // 2. Verify user exists by calling User Service
        try {
            const token = req.headers.authorization;
            const userResponse = await axios.get(
                `${USER_SERVICE_URL}/users/${userId}`,
                {
                    headers: { Authorization: token }
                }
            );

            if (!userResponse.data) {
                return res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            if (error.response?.status === 404) {
                return res.status(404).json({ error: 'User not found' });
            }
            console.error('User service call error:', error.message);
            return res.status(503).json({ error: 'User service unavailable' });
        }

        // 3. Create assignment
        const assignment = new Assignment({
            userId,
            assetId,
            assignmentDate: assignmentDate || new Date(),
            status: 'active',
            notes
        });

        await assignment.save();

        // 4. Update asset status
        asset.status = 'assigned';
        await asset.save();

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ error: 'Server error creating assignment' });
    }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // If assignment is being returned, update asset status
        if (req.body.status === 'returned' && assignment.status === 'active') {
            const asset = await Asset.findOne({ assetId: assignment.assetId });
            if (asset) {
                asset.status = 'available';
                await asset.save();
            }
        }

        res.json(assignment);
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ error: 'Server error updating assignment' });
    }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndDelete(req.params.id);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Update asset status to available
        const asset = await Asset.findOne({ assetId: assignment.assetId });
        if (asset && asset.status === 'assigned') {
            asset.status = 'available';
            await asset.save();
        }

        res.json({ message: 'Assignment deleted successfully', assignment });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ error: 'Server error deleting assignment' });
    }
};

// Get assignments by user ID
exports.getAssignmentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const assignments = await Assignment.find({ userId }).sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        console.error('Get assignments by user error:', error);
        res.status(500).json({ error: 'Server error fetching assignments' });
    }
};

// Get assignment history for an asset
exports.getAssetAssignmentHistory = async (req, res) => {
    try {
        const { assetId } = req.params;
        const assignments = await Assignment.find({ assetId }).sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        console.error('Get asset assignment history error:', error);
        res.status(500).json({ error: 'Server error fetching assignment history' });
    }
};

const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// GET /assignments - Get all assignments
router.get('/', assignmentController.getAllAssignments);

// GET /assignments/:id - Get assignment by ID
router.get('/:id', assignmentController.getAssignmentById);

// POST /assignments - Create new assignment
router.post('/', assignmentController.createAssignment);

// PUT /assignments/:id - Update assignment
router.put('/:id', assignmentController.updateAssignment);

// DELETE /assignments/:id - Delete assignment
router.delete('/:id', assignmentController.deleteAssignment);

// GET /assignments/user/:userId - Get assignments by user
router.get('/user/:userId', assignmentController.getAssignmentsByUser);

// GET /assignments/asset/:assetId - Get assignment history for asset
router.get('/asset/:assetId', assignmentController.getAssetAssignmentHistory);

module.exports = router;

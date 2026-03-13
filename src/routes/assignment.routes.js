const express = require('express');
const { body } = require('express-validator');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
} = require('../controllers/assignment.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all assignments (Teacher: all | Student: published only)
router.get('/', getAssignments);

// Get single assignment
router.get('/:id', getAssignment);

// Teacher only routes
router.post(
  '/',
  restrictTo('TEACHER'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
  ],
  createAssignment
);

router.put('/:id', restrictTo('TEACHER'), updateAssignment);

router.delete('/:id', restrictTo('TEACHER'), deleteAssignment);

router.patch(
  '/:id/status',
  restrictTo('TEACHER'),
  [body('status').notEmpty().withMessage('Status is required')],
  updateAssignmentStatus
);

module.exports = router;
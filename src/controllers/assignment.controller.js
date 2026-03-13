const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Teacher only
const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate } = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        teacherId: req.user.id,
      },
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Teacher: all | Student: published only
const getAssignments = async (req, res) => {
  try {
    const { status } = req.query;
    let where = {};

    if (req.user.role === 'STUDENT') {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status.toUpperCase();
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Protected
const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        submissions: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Students can only see published assignments
    if (req.user.role === 'STUDENT' && assignment.status !== 'PUBLISHED') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Teacher only (Draft only)
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    const assignment = await prisma.assignment.findUnique({ where: { id } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    if (assignment.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only DRAFT assignments can be edited' });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title: title || assignment.title,
        description: description || assignment.description,
        dueDate: dueDate ? new Date(dueDate) : assignment.dueDate,
      },
    });

    res.status(200).json({
      message: 'Assignment updated successfully',
      assignment: updated,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Teacher only (Draft only)
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({ where: { id } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    if (assignment.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only DRAFT assignments can be deleted' });
    }

    await prisma.assignment.delete({ where: { id } });

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update assignment status
// @route   PATCH /api/assignments/:id/status
// @access  Teacher only
const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const assignment = await prisma.assignment.findUnique({ where: { id } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate state transitions
    const validTransitions = {
      DRAFT: ['PUBLISHED'],
      PUBLISHED: ['COMPLETED'],
      COMPLETED: [],
    };

    if (!validTransitions[assignment.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${assignment.status} to ${status}. Valid transitions: ${validTransitions[assignment.status].join(', ') || 'none'}`,
      });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      message: `Assignment status updated to ${status}`,
      assignment: updated,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
};
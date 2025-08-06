const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Validation rules
const createTeamMemberValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  body('experienceYears')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
 
  
  handleValidationErrors
];

const updateTeamMemberValidation = [
  param('id').isMongoId().withMessage('Invalid team member ID'),
  ...createTeamMemberValidation
];

// @desc    Get all team members (public)
// @route   GET /api/team-members
// @access  Public
router.get('/', async (req, res) => {
  try {
    const teamMembers = await TeamMember.getActiveMembers();
    
    res.json({
      success: true,
      count: teamMembers.length,
      data: {
        teamMembers
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team members'
    });
  }
});

// @desc    Get all team members for admin (includes inactive)
// @route   GET /api/team-members/admin
// @access  Private/Admin
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const teamMembers = await TeamMember.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const total = await TeamMember.countDocuments(query);

    res.json({
      success: true,
      count: teamMembers.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        teamMembers
      }
    });
  } catch (error) {
    console.error('Get admin team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team members'
    });
  }
});

// @desc    Get single team member
// @route   GET /api/team-members/:id
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid team member ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Only return active team members for public access
    if (!teamMember.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: {
        teamMember
      }
    });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team member'
    });
  }
});

// @desc    Create team member
// @route   POST /api/team-members
// @access  Private/Admin
router.post('/', protect, adminOnly, createTeamMemberValidation, async (req, res) => {
  try {
    const teamMemberData = {
      ...req.body,
      createdBy: req.user._id
    };

    const teamMember = await TeamMember.create(teamMemberData);

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: {
        teamMember
      }
    });
  } catch (error) {
    console.error('Create team member error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating team member'
    });
  }
});

// @desc    Update team member
// @route   PUT /api/team-members/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateTeamMemberValidation, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: {
        teamMember: updatedTeamMember
      }
    });
  } catch (error) {
    console.error('Update team member error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating team member'
    });
  }
});

// @desc    Delete team member
// @route   DELETE /api/team-members/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid team member ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    await TeamMember.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting team member'
    });
  }
});

// @desc    Toggle team member active status
// @route   PATCH /api/team-members/:id/toggle-active
// @access  Private/Admin
router.patch('/:id/toggle-active', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid team member ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    await teamMember.toggleActive();

    res.json({
      success: true,
      message: `Team member ${teamMember.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        teamMember
      }
    });
  } catch (error) {
    console.error('Toggle team member active error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling team member status'
    });
  }
});

module.exports = router;

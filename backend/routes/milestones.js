const express = require('express');
const router = express.Router();
const Milestone = require('../models/Milestone');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Validation rules
const createMilestoneValidation = [
  body('year')
    .trim()
    .notEmpty()
    .withMessage('Year is required')
    .matches(/^\d{4}$/)
    .withMessage('Year must be a 4-digit number'),
  body('heading')
    .trim()
    .notEmpty()
    .withMessage('Heading is required')
    .isLength({ max: 100 })
    .withMessage('Heading cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  handleValidationErrors
];

const updateMilestoneValidation = [
  param('id').isMongoId().withMessage('Invalid milestone ID'),
  ...createMilestoneValidation
];

// @desc    Get all milestones (public)
// @route   GET /api/milestones
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { startYear, endYear } = req.query;
    
    let milestones;
    if (startYear && endYear) {
      milestones = await Milestone.getMilestonesByYearRange(startYear, endYear);
    } else {
      milestones = await Milestone.getActiveMilestones();
    }
    
    res.json({
      success: true,
      count: milestones.length,
      data: {
        milestones
      }
    });
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching milestones'
    });
  }
});

// @desc    Get all milestones for admin (includes inactive)
// @route   GET /api/milestones/admin
// @access  Private/Admin
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const year = req.query.year || '';

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { heading: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { year: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (year) {
      query.year = year;
    }

    const milestones = await Milestone.find(query)
      .sort({ year: -1, sortOrder: 1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const total = await Milestone.countDocuments(query);

    res.json({
      success: true,
      count: milestones.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        milestones
      }
    });
  } catch (error) {
    console.error('Get admin milestones error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching milestones'
    });
  }
});

// @desc    Get single milestone
// @route   GET /api/milestones/:id
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid milestone ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Only return active milestones for public access
    if (!milestone.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    res.json({
      success: true,
      data: {
        milestone
      }
    });
  } catch (error) {
    console.error('Get milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching milestone'
    });
  }
});

// @desc    Create milestone
// @route   POST /api/milestones
// @access  Private/Admin
router.post('/', protect, adminOnly, createMilestoneValidation, async (req, res) => {
  try {
    const milestoneData = {
      ...req.body,
      createdBy: req.user._id
    };

    const milestone = await Milestone.create(milestoneData);

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: {
        milestone
      }
    });
  } catch (error) {
    console.error('Create milestone error:', error);
    
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
      message: 'Server error while creating milestone'
    });
  }
});

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateMilestoneValidation, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    const updatedMilestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: {
        milestone: updatedMilestone
      }
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    
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
      message: 'Server error while updating milestone'
    });
  }
});

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid milestone ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    await Milestone.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting milestone'
    });
  }
});

// @desc    Toggle milestone active status
// @route   PATCH /api/milestones/:id/toggle-active
// @access  Private/Admin
router.patch('/:id/toggle-active', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid milestone ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    await milestone.toggleActive();

    res.json({
      success: true,
      message: `Milestone ${milestone.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        milestone
      }
    });
  } catch (error) {
    console.error('Toggle milestone active error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling milestone status'
    });
  }
});

module.exports = router;

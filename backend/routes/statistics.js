const express = require('express');
const router = express.Router();
const SiteStatistic = require('../models/SiteStatistic');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Validation rules
const createStatisticValidation = [
  body('key')
    .trim()
    .notEmpty()
    .withMessage('Key is required')
    .matches(/^[a-z_]+$/)
    .withMessage('Key must contain only lowercase letters and underscores')
    .isLength({ max: 50 })
    .withMessage('Key cannot exceed 50 characters'),
  body('label')
    .trim()
    .notEmpty()
    .withMessage('Label is required')
    .isLength({ max: 100 })
    .withMessage('Label cannot exceed 100 characters'),
  body('value')
    .trim()
    .notEmpty()
    .withMessage('Value is required')
    .isLength({ max: 50 })
    .withMessage('Value cannot exceed 50 characters'),
  body('category')
    .isIn(['company', 'projects', 'clients', 'experience', 'achievements', 'other'])
    .withMessage('Invalid category'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code'),
  handleValidationErrors
];

const updateStatisticValidation = [
  param('id').isMongoId().withMessage('Invalid statistic ID'),
  ...createStatisticValidation
];

// @desc    Get all active statistics (public)
// @route   GET /api/statistics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { location, category } = req.query;
    
    let statistics;
    if (location) {
      statistics = await SiteStatistic.getStatisticsByLocation(location);
    } else if (category) {
      statistics = await SiteStatistic.getStatisticsByCategory(category);
    } else {
      statistics = await SiteStatistic.getActiveStatistics();
    }
    
    res.json({
      success: true,
      count: statistics.length,
      data: {
        statistics
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @desc    Get footer statistics (public)
// @route   GET /api/statistics/footer
// @access  Public
router.get('/footer', async (req, res) => {
  try {
    const statistics = await SiteStatistic.getFooterStatistics();
    
    res.json({
      success: true,
      count: statistics.length,
      data: {
        statistics
      }
    });
  } catch (error) {
    console.error('Get footer statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching footer statistics'
    });
  }
});

// @desc    Get statistics by location (public)
// @route   GET /api/statistics/location/:location
// @access  Public
router.get('/location/:location', [
  param('location').isIn(['home', 'about', 'footer']).withMessage('Invalid location'),
  handleValidationErrors
], async (req, res) => {
  try {
    const statistics = await SiteStatistic.getStatisticsByLocation(req.params.location);
    
    res.json({
      success: true,
      count: statistics.length,
      data: {
        statistics
      }
    });
  } catch (error) {
    console.error('Get statistics by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @desc    Get all statistics for admin (includes inactive)
// @route   GET /api/statistics/admin
// @access  Private/Admin
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const category = req.query.category || '';

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { key: { $regex: search, $options: 'i' } },
        { label: { $regex: search, $options: 'i' } },
        { value: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (category) {
      query.category = category;
    }

    const statistics = await SiteStatistic.find(query)
      .sort({ category: 1, displayOrder: 1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy updatedBy', 'name email');

    const total = await SiteStatistic.countDocuments(query);

    res.json({
      success: true,
      count: statistics.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        statistics
      }
    });
  } catch (error) {
    console.error('Get admin statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @desc    Get single statistic
// @route   GET /api/statistics/:id
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid statistic ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const statistic = await SiteStatistic.findById(req.params.id);
    
    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    // Only return active statistics for public access
    if (!statistic.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    res.json({
      success: true,
      data: {
        statistic
      }
    });
  } catch (error) {
    console.error('Get statistic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistic'
    });
  }
});

// @desc    Create statistic
// @route   POST /api/statistics
// @access  Private/Admin
router.post('/', protect, adminOnly, createStatisticValidation, async (req, res) => {
  try {
    const statisticData = {
      ...req.body,
      createdBy: req.user._id
    };

    const statistic = await SiteStatistic.create(statisticData);

    res.status(201).json({
      success: true,
      message: 'Statistic created successfully',
      data: {
        statistic
      }
    });
  } catch (error) {
    console.error('Create statistic error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating statistic'
    });
  }
});

// @desc    Update statistic
// @route   PUT /api/statistics/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateStatisticValidation, async (req, res) => {
  try {
    const statistic = await SiteStatistic.findById(req.params.id);
    
    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    const updatedStatistic = await SiteStatistic.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Statistic updated successfully',
      data: {
        statistic: updatedStatistic
      }
    });
  } catch (error) {
    console.error('Update statistic error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating statistic'
    });
  }
});

// @desc    Update statistic value only
// @route   PATCH /api/statistics/:id/value
// @access  Private/Admin
router.patch('/:id/value', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid statistic ID'),
  body('value')
    .trim()
    .notEmpty()
    .withMessage('Value is required')
    .isLength({ max: 50 })
    .withMessage('Value cannot exceed 50 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const statistic = await SiteStatistic.findById(req.params.id);
    
    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    await statistic.updateValue(req.body.value, req.user._id);

    res.json({
      success: true,
      message: 'Statistic value updated successfully',
      data: {
        statistic
      }
    });
  } catch (error) {
    console.error('Update statistic value error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating statistic value'
    });
  }
});

// @desc    Delete statistic
// @route   DELETE /api/statistics/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid statistic ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const statistic = await SiteStatistic.findById(req.params.id);
    
    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    await SiteStatistic.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Statistic deleted successfully'
    });
  } catch (error) {
    console.error('Delete statistic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting statistic'
    });
  }
});

// @desc    Toggle statistic active status
// @route   PATCH /api/statistics/:id/toggle-active
// @access  Private/Admin
router.patch('/:id/toggle-active', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid statistic ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const statistic = await SiteStatistic.findById(req.params.id);
    
    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    await statistic.toggleActive();

    res.json({
      success: true,
      message: `Statistic ${statistic.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        statistic
      }
    });
  } catch (error) {
    console.error('Toggle statistic active error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling statistic status'
    });
  }
});

module.exports = router;

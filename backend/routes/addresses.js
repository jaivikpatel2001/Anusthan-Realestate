const express = require('express');
const router = express.Router();
const CompanyAddress = require('../models/CompanyAddress');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Validation rules
const createAddressValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Address name is required')
    .isLength({ max: 100 })
    .withMessage('Address name cannot exceed 100 characters'),
  body('addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required')
    .isLength({ max: 200 })
    .withMessage('Address line 1 cannot exceed 200 characters'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit postal code'),
  body('type')
    .isIn(['headquarters', 'branch', 'sales_office', 'site_office', 'other'])
    .withMessage('Invalid address type'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  handleValidationErrors
];

const updateAddressValidation = [
  param('id').isMongoId().withMessage('Invalid address ID'),
  ...createAddressValidation
];

// @desc    Get all active addresses (public)
// @route   GET /api/addresses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { location } = req.query;
    
    let addresses;
    if (location === 'footer') {
      addresses = await CompanyAddress.getFooterAddresses();
    } else if (location === 'contact') {
      addresses = await CompanyAddress.getContactPageAddresses();
    } else {
      addresses = await CompanyAddress.getWebsiteAddresses();
    }
    
    res.json({
      success: true,
      count: addresses.length,
      data: {
        addresses
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addresses'
    });
  }
});

// @desc    Get primary address (public)
// @route   GET /api/addresses/primary
// @access  Public
router.get('/primary', async (req, res) => {
  try {
    const address = await CompanyAddress.getPrimaryAddress();
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No primary address found'
      });
    }
    
    res.json({
      success: true,
      data: {
        address
      }
    });
  } catch (error) {
    console.error('Get primary address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching primary address'
    });
  }
});

// @desc    Get all addresses for admin (includes inactive)
// @route   GET /api/addresses/admin
// @access  Private/Admin
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const type = req.query.type || '';

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { addressLine1: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (type) {
      query.type = type;
    }

    const addresses = await CompanyAddress.find(query)
      .sort({ isPrimary: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy updatedBy', 'name email');

    const total = await CompanyAddress.countDocuments(query);

    res.json({
      success: true,
      count: addresses.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        addresses
      }
    });
  } catch (error) {
    console.error('Get admin addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addresses'
    });
  }
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid address ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const address = await CompanyAddress.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Only return active addresses for public access
    if (!address.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: {
        address
      }
    });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching address'
    });
  }
});

// @desc    Create address
// @route   POST /api/addresses
// @access  Private/Admin
router.post('/', protect, adminOnly, createAddressValidation, async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      createdBy: req.user._id
    };

    const address = await CompanyAddress.create(addressData);

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: {
        address
      }
    });
  } catch (error) {
    console.error('Create address error:', error);
    
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
      message: 'Server error while creating address'
    });
  }
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateAddressValidation, async (req, res) => {
  try {
    const address = await CompanyAddress.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const updatedAddress = await CompanyAddress.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: updatedAddress
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    
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
      message: 'Server error while updating address'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid address ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const address = await CompanyAddress.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Prevent deletion of primary address
    if (address.isPrimary) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete primary address. Please set another address as primary first.'
      });
    }

    await CompanyAddress.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting address'
    });
  }
});

// @desc    Set address as primary
// @route   PATCH /api/addresses/:id/set-primary
// @access  Private/Admin
router.patch('/:id/set-primary', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid address ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const address = await CompanyAddress.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.setAsPrimary();

    res.json({
      success: true,
      message: 'Address set as primary successfully',
      data: {
        address
      }
    });
  } catch (error) {
    console.error('Set primary address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting primary address'
    });
  }
});

// @desc    Toggle address active status
// @route   PATCH /api/addresses/:id/toggle-active
// @access  Private/Admin
router.patch('/:id/toggle-active', protect, adminOnly, [
  param('id').isMongoId().withMessage('Invalid address ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const address = await CompanyAddress.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Prevent deactivating primary address
    if (address.isPrimary && address.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate primary address. Please set another address as primary first.'
      });
    }

    await address.toggleActive();

    res.json({
      success: true,
      message: `Address ${address.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        address
      }
    });
  } catch (error) {
    console.error('Toggle address active error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling address status'
    });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const { protect, adminOnly } = require('../middleware/auth');
const { validateApartment } = require('../middleware/validation');
const Apartment = require('../models/Apartment');
const Project = require('../models/Project');

const router = express.Router();

// @desc    Get all apartments with filtering
// @route   GET /api/apartments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      type,
      bedrooms,
      bathrooms,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      facing,
      available,
      sort = 'sortOrder'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (projectId) query.projectId = projectId;
    if (type) query.type = new RegExp(type, 'i');
    if (bedrooms) query.bedrooms = Number(bedrooms);
    if (bathrooms) query.bathrooms = Number(bathrooms);
    if (facing) query.facing = facing;
    if (available !== undefined) query['availability.isAvailable'] = available === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      query['price.base'] = {};
      if (minPrice) query['price.base'].$gte = Number(minPrice);
      if (maxPrice) query['price.base'].$lte = Number(maxPrice);
    }

    // Area range filter
    if (minArea || maxArea) {
      query['area.builtUp'] = {};
      if (minArea) query['area.builtUp'].$gte = Number(minArea);
      if (maxArea) query['area.builtUp'].$lte = Number(maxArea);
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const apartments = await Apartment.find(query)
      .populate('projectId', 'title location status category')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Apartment.countDocuments(query);

    res.json({
      success: true,
      data: {
        apartments,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalApartments: total,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get apartments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch apartments',
      error: error.message
    });
  }
});

// @desc    Get apartments by project ID
// @route   GET /api/apartments/project/:projectId
// @access  Public
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { available, sort = 'sortOrder' } = req.query;

    // Build query
    const query = { projectId, isActive: true };
    if (available !== undefined) query['availability.isAvailable'] = available === 'true';

    const apartments = await Apartment.find(query)
      .populate('projectId', 'title location status')
      .sort(sort);

    res.json({
      success: true,
      data: { apartments }
    });
  } catch (error) {
    console.error('Get project apartments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project apartments',
      error: error.message
    });
  }
});

// @desc    Get single apartment by ID
// @route   GET /api/apartments/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('projectId')
      .populate('createdBy', 'name email');

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'Apartment not found'
      });
    }

    res.json({
      success: true,
      data: { apartment }
    });
  } catch (error) {
    console.error('Get apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch apartment',
      error: error.message
    });
  }
});

// @desc    Create new apartment
// @route   POST /api/apartments
// @access  Private/Admin
router.post('/', protect, adminOnly, validateApartment.create, async (req, res) => {
  try {
    // Verify project exists
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const apartmentData = {
      ...req.body,
      createdBy: req.user._id
    };

    const apartment = new Apartment(apartmentData);
    await apartment.save();

    const populatedApartment = await Apartment.findById(apartment._id)
      .populate('projectId', 'title location')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Apartment created successfully',
      data: { apartment: populatedApartment }
    });
  } catch (error) {
    console.error('Create apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create apartment',
      error: error.message
    });
  }
});

// @desc    Update apartment
// @route   PUT /api/apartments/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'Apartment not found'
      });
    }

    // Update apartment fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        apartment[key] = req.body[key];
      }
    });

    await apartment.save();

    const updatedApartment = await Apartment.findById(apartment._id)
      .populate('projectId', 'title location')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Apartment updated successfully',
      data: { apartment: updatedApartment }
    });
  } catch (error) {
    console.error('Update apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update apartment',
      error: error.message
    });
  }
});

// @desc    Delete apartment (soft delete)
// @route   DELETE /api/apartments/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'Apartment not found'
      });
    }

    // Soft delete - set isActive to false
    apartment.isActive = false;
    await apartment.save();

    res.json({
      success: true,
      message: 'Apartment deleted successfully'
    });
  } catch (error) {
    console.error('Delete apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete apartment',
      error: error.message
    });
  }
});

// @desc    Book apartment units
// @route   PATCH /api/apartments/:id/book
// @access  Private/Admin
router.patch('/:id/book', protect, adminOnly, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'Apartment not found'
      });
    }

    await apartment.bookUnits(quantity);

    res.json({
      success: true,
      message: `${quantity} unit(s) booked successfully`,
      data: {
        availableUnits: apartment.availability.availableUnits,
        soldUnits: apartment.availability.soldUnits,
        isAvailable: apartment.availability.isAvailable
      }
    });
  } catch (error) {
    console.error('Book apartment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to book apartment',
      error: error.message
    });
  }
});

// @desc    Release apartment units
// @route   PATCH /api/apartments/:id/release
// @access  Private/Admin
router.patch('/:id/release', protect, adminOnly, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'Apartment not found'
      });
    }

    await apartment.releaseUnits(quantity);

    res.json({
      success: true,
      message: `${quantity} unit(s) released successfully`,
      data: {
        availableUnits: apartment.availability.availableUnits,
        soldUnits: apartment.availability.soldUnits,
        isAvailable: apartment.availability.isAvailable
      }
    });
  } catch (error) {
    console.error('Release apartment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to release apartment units',
      error: error.message
    });
  }
});

// @desc    Get apartment types for a project
// @route   GET /api/apartments/project/:projectId/types
// @access  Public
router.get('/project/:projectId/types', async (req, res) => {
  try {
    const { projectId } = req.params;

    const types = await Apartment.aggregate([
      {
        $match: {
          projectId: mongoose.Types.ObjectId(projectId),
          isActive: true
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          minPrice: { $min: '$price.base' },
          maxPrice: { $max: '$price.base' },
          minArea: { $min: '$area.builtUp' },
          maxArea: { $max: '$area.builtUp' },
          availableUnits: { $sum: '$availability.availableUnits' }
        }
      },
      {
        $sort: { minPrice: 1 }
      }
    ]);

    res.json({
      success: true,
      data: { types }
    });
  } catch (error) {
    console.error('Get apartment types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch apartment types',
      error: error.message
    });
  }
});

module.exports = router;

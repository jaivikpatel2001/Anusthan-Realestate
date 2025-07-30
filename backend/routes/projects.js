const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');
const Project = require('../models/Project');
const Apartment = require('../models/Apartment');

const router = express.Router();

// @desc    Get all projects with filtering, sorting, and pagination
// @route   GET /api/projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      location,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      featured
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (status) query.status = status;
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');
    if (featured !== undefined) query.isFeatured = featured === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    // Add apartment count to each project
    const projectsWithApartments = await Promise.all(
      projects.map(async (project) => {
        const apartmentCount = await Apartment.countDocuments({
          projectId: project._id,
          isActive: true
        });
        return { ...project, apartmentCount };
      })
    );

    res.json({
      success: true,
      data: {
        projects: projectsWithApartments,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalProjects: total,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// @desc    Get project statistics
// @route   GET /api/projects/admin/stats/overview
// @access  Private/Admin
router.get('/admin/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          upcomingProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] }
          },
          ongoingProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          featuredProjects: {
            $sum: { $cond: ['$isFeatured', 1, 0] }
          },
          totalViews: { $sum: '$viewCount' },
          totalLeads: { $sum: '$leadCount' },
          avgStartingPrice: { $avg: '$startingPrice' }
        }
      }
    ]);

    const categoryStats = await Project.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$startingPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalProjects: 0,
          upcomingProjects: 0,
          ongoingProjects: 0,
          completedProjects: 0,
          featuredProjects: 0,
          totalViews: 0,
          totalLeads: 0,
          avgStartingPrice: 0
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
});

// @desc    Get single project by ID or slug
// @route   GET /api/projects/:identifier
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = identifier;
    } else {
      query.slug = identifier;
    }
    
    query.isActive = true;

    const project = await Project.findOne(query)
      .populate('createdBy', 'name email')
      .populate({
        path: 'apartments',
        match: { isActive: true },
        options: { sort: { sortOrder: 1, type: 1 } }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment view count
    await project.incrementViewCount();

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
router.post('/', protect, adminOnly, validateProject.create, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.user._id
    };

    const project = new Project(projectData);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: populatedProject }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, validateProject.update, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        project[key] = req.body[key];
      }
    });

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// @desc    Delete project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Soft delete - set isActive to false
    project.isActive = false;
    await project.save();

    // Also deactivate associated apartments
    await Apartment.updateMany(
      { projectId: project._id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// @desc    Toggle project featured status
// @route   PATCH /api/projects/:id/featured
// @access  Private/Admin
router.patch('/:id/featured', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.isFeatured = !project.isFeatured;
    await project.save();

    res.json({
      success: true,
      message: `Project ${project.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { isFeatured: project.isFeatured }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: error.message
    });
  }
});

module.exports = router;

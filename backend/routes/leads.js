const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { validateLead } = require('../middleware/validation');
const Lead = require('../models/Lead');
const Project = require('../models/Project');

const router = express.Router();

// @desc    Create new lead (Public - for brochure downloads, contact forms)
// @route   POST /api/leads
// @access  Public
router.post('/', validateLead.create, async (req, res) => {
  try {
    // Verify project exists
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check for duplicate lead (same mobile + project)
    const existingLead = await Lead.findOne({
      mobile: req.body.mobile,
      projectId: req.body.projectId,
      isActive: true
    });

    if (existingLead) {
      // Update existing lead with new information
      if (req.body.email && !existingLead.email) {
        existingLead.email = req.body.email;
      }
      if (req.body.name && !existingLead.name) {
        existingLead.name = req.body.name;
      }
      if (req.body.leadType) {
        existingLead.leadType = req.body.leadType;
      }

      // Add to contact history
      existingLead.contactHistory.push({
        method: 'website',
        notes: `Duplicate lead submission - ${req.body.leadType || 'general inquiry'}`,
        outcome: 'successful'
      });

      await existingLead.save();

      return res.json({
        success: true,
        message: 'Lead information updated successfully',
        data: { lead: existingLead }
      });
    }

    // Create new lead
    const leadData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer')
    };

    const lead = new Lead(leadData);
    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('projectId', 'title location')
      .populate('apartmentId', 'type bedrooms bathrooms');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead: populatedLead }
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message
    });
  }
});

// @desc    Download brochure (triggers lead creation)
// @route   POST /api/leads/brochure-download
// @access  Public
router.post('/brochure-download', validateLead.create, async (req, res) => {
  try {
    const { projectId, mobile, email, name } = req.body;

    // Verify project exists and has brochure
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.brochure || !project.brochure.url) {
      return res.status(404).json({
        success: false,
        message: 'Brochure not available for this project'
      });
    }

    // Create or update lead
    let lead = await Lead.findOne({
      mobile,
      projectId,
      isActive: true
    });

    if (lead) {
      // Update existing lead
      if (email && !lead.email) lead.email = email;
      if (name && !lead.name) lead.name = name;
      lead.leadType = 'brochure_download';

      lead.contactHistory.push({
        method: 'website',
        notes: 'Brochure download request',
        outcome: 'successful'
      });

      await lead.save();
    } else {
      // Create new lead
      const leadData = {
        name,
        mobile,
        email,
        projectId,
        leadType: 'brochure_download',
        source: 'website',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer')
      };

      lead = new Lead(leadData);
      await lead.save();
    }

    res.json({
      success: true,
      message: 'Lead captured successfully. Brochure download will start shortly.',
      data: {
        brochureUrl: project.brochure.url,
        projectTitle: project.title,
        leadId: lead._id
      }
    });
  } catch (error) {
    console.error('Brochure download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process brochure download',
      error: error.message
    });
  }
});

// @desc    Get leads requiring follow-up
// @route   GET /api/leads/follow-up
// @access  Private/Admin
router.get('/follow-up', protect, adminOnly, async (req, res) => {
  try {
    const { date } = req.query;
    const followUpDate = date ? new Date(date) : new Date();

    const leads = await Lead.getFollowUpLeads(followUpDate);

    res.json({
      success: true,
      data: { leads, count: leads.length }
    });
  } catch (error) {
    console.error('Get follow-up leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch follow-up leads',
      error: error.message
    });
  }
});

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const { projectId, dateFrom, dateTo } = req.query;

    let dateRange = null;
    if (dateFrom || dateTo) {
      dateRange = {
        start: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: dateTo ? new Date(dateTo) : new Date()
      };
    }

    const stats = await Lead.getLeadStats(projectId, dateRange);

    // Get additional statistics
    const totalLeads = await Lead.countDocuments({ isActive: true });
    const qualifiedLeads = await Lead.countDocuments({ isActive: true, isQualified: true });
    const convertedLeads = await Lead.countDocuments({ isActive: true, status: 'converted' });

    // Get leads by source
    const sourceStats = await Lead.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get leads by lead type
    const typeStats = await Lead.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$leadType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        overview: {
          totalLeads,
          qualifiedLeads,
          convertedLeads,
          conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0
        },
        sourceBreakdown: sourceStats,
        typeBreakdown: typeStats
      }
    });
  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead statistics',
      error: error.message
    });
  }
});

// @desc    Export leads to CSV
// @route   GET /api/leads/export
// @access  Private/Admin
router.get('/export', protect, adminOnly, async (req, res) => {
  try {
    const {
      projectId,
      status,
      dateFrom,
      dateTo,
      format = 'csv'
    } = req.query;

    // Build query
    const query = { isActive: true };
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const leads = await Lead.find(query)
      .populate('projectId', 'title location')
      .populate('assignedTo', 'name email')
      .sort('-createdAt')
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Name', 'Mobile', 'Email', 'Project', 'Status', 'Priority',
        'Source', 'Lead Type', 'Assigned To', 'Created Date', 'Last Contacted'
      ];

      const csvRows = leads.map(lead => [
        lead.name || '',
        lead.mobile,
        lead.email || '',
        lead.projectId?.title || '',
        lead.status,
        lead.priority,
        lead.source,
        lead.leadType,
        lead.assignedTo?.name || '',
        new Date(lead.createdAt).toLocaleDateString(),
        lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: { leads, count: leads.length }
      });
    }
  } catch (error) {
    console.error('Export leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export leads',
      error: error.message
    });
  }
});

// @desc    Get all leads with filtering and pagination
// @route   GET /api/leads
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      projectId,
      status,
      priority,
      source,
      leadType,
      assignedTo,
      dateFrom,
      dateTo,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (leadType) query.leadType = leadType;
    if (assignedTo) query.assignedTo = assignedTo;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const leads = await Lead.find(query)
      .populate('projectId', 'title location status')
      .populate('apartmentId', 'type bedrooms bathrooms')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalLeads: total,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private/Admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('projectId')
      .populate('apartmentId')
      .populate('assignedTo', 'name email')
      .populate('contactHistory.contactedBy', 'name email')
      .populate('notes.addedBy', 'name email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message
    });
  }
});

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Update lead fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'contactHistory' && key !== 'notes') {
        lead[key] = req.body[key];
      }
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('projectId', 'title location')
      .populate('apartmentId', 'type bedrooms bathrooms')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead: updatedLead }
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message
    });
  }
});

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private/Admin
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.updateStatus(status, req.user._id);

    res.json({
      success: true,
      message: 'Lead status updated successfully',
      data: { status: lead.status }
    });
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead status',
      error: error.message
    });
  }
});

// @desc    Add contact history to lead
// @route   POST /api/leads/:id/contact
// @access  Private/Admin
router.post('/:id/contact', protect, adminOnly, async (req, res) => {
  try {
    const { method, notes, outcome } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const contactData = {
      method,
      notes,
      outcome,
      contactedBy: req.user._id
    };

    await lead.addContactHistory(contactData);

    res.json({
      success: true,
      message: 'Contact history added successfully'
    });
  } catch (error) {
    console.error('Add contact history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add contact history',
      error: error.message
    });
  }
});

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private/Admin
router.post('/:id/notes', protect, adminOnly, async (req, res) => {
  try {
    const { content, isImportant = false } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const noteData = {
      content,
      isImportant,
      addedBy: req.user._id
    };

    await lead.addNote(noteData);

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
});

// @desc    Schedule follow-up for lead
// @route   PATCH /api/leads/:id/follow-up
// @access  Private/Admin
router.patch('/:id/follow-up', protect, adminOnly, async (req, res) => {
  try {
    const { followUpDate, notes } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.scheduleFollowUp(new Date(followUpDate), notes, req.user._id);

    res.json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: { followUpDate: lead.followUpDate }
    });
  } catch (error) {
    console.error('Schedule follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule follow-up',
      error: error.message
    });
  }
});

module.exports = router;

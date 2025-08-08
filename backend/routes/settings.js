const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const SiteSettings = require('../models/SiteSettings');

const router = express.Router();

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public (for basic settings like company info, contact details)
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    
    // Return only public settings
    const publicSettings = {
      company: settings.company,
      contact: settings.contact,
      socialMedia: settings.socialMedia,
      businessHours: settings.businessHours,
      seo: {
        metaTitle: settings.seo.metaTitle,
        metaDescription: settings.seo.metaDescription,
        keywords: settings.seo.keywords,
        ogImage: settings.seo.ogImage
      },
      theme: settings.theme,
      integrations: {
        googleMaps: {
          isEnabled: settings.integrations.googleMaps.isEnabled,
          apiKey: settings.integrations.googleMaps.apiKey
        },
        whatsapp: {
          businessNumber: settings.integrations.whatsapp.businessNumber,
          isEnabled: settings.integrations.whatsapp.isEnabled
        }
      }
    };

    res.json({
      success: true,
      data: { settings: publicSettings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// @desc    Get all site settings (Admin only)
// @route   GET /api/settings/admin
// @access  Private/Admin
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin settings',
      error: error.message
    });
  }
});

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const settings = await SiteSettings.updateSettings(req.body, req.user._id);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

// @desc    Update company information
// @route   PUT /api/settings/company
// @access  Private/Admin
router.put('/company', protect, adminOnly, async (req, res) => {
  try {
    const { name, tagline, description, logo, favicon } = req.body;
    
    const updateData = {
      company: {
        name,
        tagline,
        description,
        logo,
        favicon
      }
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: { company: settings.company }
    });
  } catch (error) {
    console.error('Update company info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company information',
      error: error.message
    });
  }
});

// @desc    Update contact information
// @route   PUT /api/settings/contact
// @access  Private/Admin
router.put('/contact', protect, adminOnly, async (req, res) => {
  try {
    const updateData = {
      contact: req.body
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: { contact: settings.contact }
    });
  } catch (error) {
    console.error('Update contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information',
      error: error.message
    });
  }
});

// @desc    Update social media links
// @route   PUT /api/settings/social-media
// @access  Private/Admin
router.put('/social-media', protect, adminOnly, async (req, res) => {
  try {
    const updateData = {
      socialMedia: req.body
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: 'Social media links updated successfully',
      data: { socialMedia: settings.socialMedia }
    });
  } catch (error) {
    console.error('Update social media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social media links',
      error: error.message
    });
  }
});

// @desc    Update SEO settings
// @route   PUT /api/settings/seo
// @access  Private/Admin
router.put('/seo', protect, adminOnly, async (req, res) => {
  try {
    const updateData = {
      seo: req.body
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: 'SEO settings updated successfully',
      data: { seo: settings.seo }
    });
  } catch (error) {
    console.error('Update SEO settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SEO settings',
      error: error.message
    });
  }
});

// @desc    Update business hours
// @route   PUT /api/settings/business-hours
// @access  Private/Admin
router.put('/business-hours', protect, adminOnly, async (req, res) => {
  try {
    const updateData = {
      businessHours: req.body
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: 'Business hours updated successfully',
      data: { businessHours: settings.businessHours }
    });
  } catch (error) {
    console.error('Update business hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business hours',
      error: error.message
    });
  }
});

// @desc    Update integrations
// @route   PUT /api/settings/integrations
// @access  Private/Admin
router.put('/integrations', protect, adminOnly, async (req, res) => {
  try {
    const updateData = {
      integrations: req.body
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: 'Integration settings updated successfully',
      data: { integrations: settings.integrations }
    });
  } catch (error) {
    console.error('Update integrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update integration settings',
      error: error.message
    });
  }
});

// @desc    Update theme settings
// @route   PUT /api/settings/theme
// @access  Private/Admin
router.put('/theme', protect, adminOnly, async (req, res) => {
  try {
    const updateData = {
      theme: req.body
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: 'Theme settings updated successfully',
      data: { theme: settings.theme }
    });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update theme settings',
      error: error.message
    });
  }
});

// @desc    Toggle maintenance mode
// @route   PATCH /api/settings/maintenance
// @access  Private/Admin
router.patch('/maintenance', protect, adminOnly, async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage } = req.body;
    
    const updateData = {
      website: {
        maintenanceMode,
        maintenanceMessage
      }
    };

    const settings = await SiteSettings.updateSettings(updateData, req.user._id);

    res.json({
      success: true,
      message: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'}`,
      data: { 
        maintenanceMode: settings.website.maintenanceMode,
        maintenanceMessage: settings.website.maintenanceMessage
      }
    });
  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode',
      error: error.message
    });
  }
});

module.exports = router;

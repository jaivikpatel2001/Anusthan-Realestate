const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadConfigs, getFileUrl, deleteFile } = require('../utils/fileUpload');
const { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');

const router = express.Router();

// Helper function to handle dual upload strategy
const handleFileUpload = async (req, file, folder = 'general') => {
  try {
    let result = {
      success: false,
      url: null,
      publicId: null,
      localPath: null
    };

    // If Cloudinary is configured, try uploading there first
    if (isCloudinaryConfigured()) {
      const cloudinaryResult = await uploadToCloudinary(file.path, folder);
      
      if (cloudinaryResult.success) {
        result = {
          success: true,
          url: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId,
          localPath: null
        };
      } else {
        console.log('Cloudinary upload failed, using local storage:', cloudinaryResult.error);
        // Keep the local file as fallback
        result = {
          success: true,
          url: getFileUrl(req, file.path),
          publicId: null,
          localPath: file.path
        };
      }
    } else {
      // Use local storage
      result = {
        success: true,
        url: getFileUrl(req, file.path),
        publicId: null,
        localPath: file.path
      };
    }

    return result;
  } catch (error) {
    console.error('File upload error:', error);
    // Clean up local file if it exists
    if (file && file.path && fs.existsSync(file.path)) {
      deleteFile(file.path);
    }
    throw error;
  }
};

// Upload site images (logo, favicon, etc.)
router.post('/site-images', protect, adminOnly, uploadConfigs.siteImages.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await handleFileUpload(req, req.file, 'realstate/site');

    res.json({
      success: true,
      message: 'Site image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Site image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload site image',
      error: error.message
    });
  }
});

// Upload project images
router.post('/project-images', protect, adminOnly, uploadConfigs.projectImages.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(file => handleFileUpload(req, file, 'realstate/projects'));
    const results = await Promise.all(uploadPromises);

    const uploadedFiles = results.map((result, index) => ({
      url: result.url,
      publicId: result.publicId,
      filename: req.files[index].filename,
      originalName: req.files[index].originalname,
      size: req.files[index].size,
      mimetype: req.files[index].mimetype
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} project images uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Project images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload project images',
      error: error.message
    });
  }
});

// Upload floor plans
router.post('/floor-plans', protect, adminOnly, uploadConfigs.floorPlans.single('floorPlan'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await handleFileUpload(req, req.file, 'realstate/floorplans');

    res.json({
      success: true,
      message: 'Floor plan uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Floor plan upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload floor plan',
      error: error.message
    });
  }
});

// Upload brochures
router.post('/brochures', protect, adminOnly, uploadConfigs.brochures.single('brochure'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await handleFileUpload(req, req.file, 'realstate/brochures');

    res.json({
      success: true,
      message: 'Brochure uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Brochure upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload brochure',
      error: error.message
    });
  }
});

// Delete file (works for both Cloudinary and local)
router.delete('/delete', protect, adminOnly, async (req, res) => {
  try {
    const { publicId, localPath } = req.body;

    if (!publicId && !localPath) {
      return res.status(400).json({
        success: false,
        message: 'Either publicId or localPath is required'
      });
    }

    let deleteResult = { success: false };

    // Try to delete from Cloudinary if publicId is provided
    if (publicId && isCloudinaryConfigured()) {
      deleteResult = await deleteFromCloudinary(publicId);
    }

    // Delete local file if localPath is provided or Cloudinary delete failed
    if (localPath || !deleteResult.success) {
      const filePath = localPath || path.join(__dirname, '..', 'uploads', publicId);
      if (fs.existsSync(filePath)) {
        deleteFile(filePath);
        deleteResult.success = true;
      }
    }

    if (deleteResult.success) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or could not be deleted'
      });
    }
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

// Get upload configuration info
router.get('/config', protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    data: {
      cloudinaryConfigured: isCloudinaryConfigured(),
      maxFileSize: process.env.MAX_FILE_SIZE || 10485760,
      allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(','),
      allowedDocumentTypes: (process.env.ALLOWED_DOCUMENT_TYPES || 'application/pdf').split(',')
    }
  });
});

module.exports = router;

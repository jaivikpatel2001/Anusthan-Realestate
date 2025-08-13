const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configure Cloudinary if credentials are available
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured successfully');
} else {
  console.log('Cloudinary not configured - using local storage');
}

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'realstate', options = {}) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    // Determine resource type based on file extension
    const extension = path.extname(filePath).toLowerCase();
    const isPdf = extension === '.pdf';
    const resourceType = isPdf ? 'raw' : 'auto';

    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Delete local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (filePaths, folder = 'realstate') => {
  try {
    const uploadPromises = filePaths.map(filePath => uploadToCloudinary(filePath, folder));
    const results = await Promise.all(uploadPromises);
    
    return {
      success: true,
      results: results
    };
  } catch (error) {
    console.error('Multiple upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!isCloudinaryConfigured() || !publicId) {
    return null;
  }

  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options
  };

  return cloudinary.url(publicId, defaultOptions);
};

module.exports = {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
  getOptimizedImageUrl,
  cloudinary
};

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');
  const allowedDocumentTypes = (process.env.ALLOWED_DOCUMENT_TYPES || 'application/pdf').split(',');
  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Storage configuration for different file types
const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(__dirname, '..', uploadPath);
      ensureDirectoryExists(fullPath);
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const filename = file.fieldname + '-' + uniqueSuffix + extension;
      cb(null, filename);
    }
  });
};

// Multer configurations for different upload types
const uploadConfigs = {
  siteImages: multer({
    storage: createStorage('uploads/siteImages'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    },
    fileFilter
  }),
  
  projectImages: multer({
    storage: createStorage('uploads/projectImages'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    },
    fileFilter
  }),
  
  floorPlans: multer({
    storage: createStorage('uploads/floorPlans'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    },
    fileFilter
  }),
  
  brochures: multer({
    storage: createStorage('uploads/brochures'),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    },
    fileFilter
  })
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

// Helper function to get file URL
// const getFileUrl = (req, filePath) => {
//   if (!filePath) return null;
  
//   // If it's already a full URL (Cloudinary), return as is
//   if (filePath.startsWith('http')) {
//     return filePath;
//   }
  
//   // For local files, construct the URL
//   const baseUrl = `${req.protocol}://${req.get('host')}`;
//   return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
// };


const getFileUrl = (req, filePath) => {
  // Ensure cross-platform support
  const relativePath = path.relative(path.join(__dirname, '..', 'uploads'), filePath);
  return `/uploads/${relativePath.replace(/\\/g, '/')}`;
};

module.exports = {
  uploadConfigs,
  ensureDirectoryExists,
  deleteFile,
  getFileUrl,
  fileFilter
};

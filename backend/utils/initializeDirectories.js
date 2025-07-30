const fs = require('fs');
const path = require('path');

// List of directories to create
const directories = [
  'uploads',
  'uploads/siteImages',
  'uploads/projectImages',
  'uploads/floorPlans',
  'uploads/brochures',
  'uploads/temp'
];

// Function to ensure all upload directories exist
const initializeDirectories = () => {
  console.log('Initializing upload directories...');
  
  directories.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✓ Created directory: ${dir}`);
      } catch (error) {
        console.error(`✗ Failed to create directory ${dir}:`, error.message);
      }
    } else {
      console.log(`✓ Directory already exists: ${dir}`);
    }
  });
  
  // Create .gitkeep files to ensure directories are tracked in git
  directories.forEach(dir => {
    const gitkeepPath = path.join(__dirname, '..', dir, '.gitkeep');
    
    if (!fs.existsSync(gitkeepPath)) {
      try {
        fs.writeFileSync(gitkeepPath, '# This file ensures the directory is tracked by git\n');
        console.log(`✓ Created .gitkeep in: ${dir}`);
      } catch (error) {
        console.error(`✗ Failed to create .gitkeep in ${dir}:`, error.message);
      }
    }
  });
  
  console.log('Upload directories initialization complete.');
};

// Function to clean up temporary files (can be called periodically)
const cleanupTempFiles = () => {
  const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
  
  if (!fs.existsSync(tempDir)) {
    return;
  }
  
  try {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    files.forEach(file => {
      if (file === '.gitkeep') return;
      
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temp file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Function to get directory sizes (for monitoring)
const getDirectorySizes = () => {
  const sizes = {};
  
  directories.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    
    if (fs.existsSync(fullPath)) {
      try {
        const files = fs.readdirSync(fullPath);
        let totalSize = 0;
        
        files.forEach(file => {
          if (file === '.gitkeep') return;
          
          const filePath = path.join(fullPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            totalSize += stats.size;
          }
        });
        
        sizes[dir] = {
          bytes: totalSize,
          mb: (totalSize / (1024 * 1024)).toFixed(2),
          fileCount: files.filter(f => f !== '.gitkeep').length
        };
      } catch (error) {
        sizes[dir] = { error: error.message };
      }
    } else {
      sizes[dir] = { error: 'Directory does not exist' };
    }
  });
  
  return sizes;
};

module.exports = {
  initializeDirectories,
  cleanupTempFiles,
  getDirectorySizes,
  directories
};

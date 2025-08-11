/**
 * Utility functions for handling URLs consistently across the application
 */

/**
 * Creates a full URL from a path, handling both local and external URLs
 * @param {string} path - The path or URL to process
 * @param {string} baseUrl - The base URL to use for relative paths (optional)
 * @returns {string} - The full URL
 */
export const createFullUrl = (path, baseUrl = null) => {
  if (!path) return '';
  
  // If it's already a full URL (Cloudinary, external service, or blob), return as is
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return path;
  }
  
  // Use provided base URL or default to environment variable
  const base = baseUrl || import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';
  
  // Handle paths that already start with the base URL
  if (path.startsWith(base)) {
    return path;
  }
  
  // Ensure proper path formatting
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

/**
 * Creates an image URL specifically for images
 * @param {string} imagePath - The image path or URL
 * @returns {string} - The full image URL
 */
export const createImageUrl = (imagePath) => {
  return createFullUrl(imagePath);
};

/**
 * Creates a file URL for documents, PDFs, etc.
 * @param {string} filePath - The file path or URL
 * @returns {string} - The full file URL
 */
export const createFileUrl = (filePath) => {
  return createFullUrl(filePath);
};

/**
 * Validates if a URL is a valid HTTP/HTTPS URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Extracts the filename from a URL or path
 * @param {string} url - The URL or path
 * @returns {string} - The filename
 */
export const getFilenameFromUrl = (url) => {
  if (!url) return '';
  
  try {
    // Handle URLs with query parameters
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || '';
  } catch {
    // Fallback for relative paths
    return url.split('/').pop() || '';
  }
};

/**
 * Checks if a URL points to an image based on file extension
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's likely an image
 */
export const isImageUrl = (url) => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const filename = getFilenameFromUrl(url).toLowerCase();
  
  return imageExtensions.some(ext => filename.endsWith(ext));
};

/**
 * Checks if a URL points to a PDF based on file extension
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's likely a PDF
 */
export const isPdfUrl = (url) => {
  if (!url) return false;
  
  const filename = getFilenameFromUrl(url).toLowerCase();
  return filename.endsWith('.pdf');
};

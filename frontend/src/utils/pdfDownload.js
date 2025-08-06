/**
 * Enhanced PDF download utility with proper error handling and blob support
 * Ensures complete PDF download and handles various edge cases
 */

/**
 * Download a PDF file with enhanced error handling
 * @param {string} url - The URL of the PDF file
 * @param {string} filename - The desired filename for download
 * @param {Function} showError - Error toast function (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const downloadPDF = async (url, filename, showError = null) => {
  try {
    const fullUrl = url.startsWith('http') ? url : 
                  (url.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}` : url);
    
    console.log(`Starting PDF download: ${filename} from ${fullUrl}`);

    // Fetch the PDF as a blob to ensure complete download
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include' // Include cookies for authenticated requests
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Verify it's a PDF
    if (blob.type !== 'application/pdf' && !blob.type.includes('pdf')) {
      console.warn('Downloaded file may not be a valid PDF:', blob.type);
    }

    // Check if blob has content
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL after a short delay
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);

    console.log(`PDF downloaded successfully: ${filename}, Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
    return true;

  } catch (error) {
    console.error('PDF download error:', error);
    
    if (showError) {
      showError(`Failed to download PDF: ${error.message}`);
    }
    
    // Fallback to direct link approach
    try {
      console.log('Attempting fallback download method...');
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Fallback download initiated');
      return true;
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError);
      
      if (showError) {
        showError('Unable to download PDF. Please try opening the link in a new tab.');
      }
      
      return false;
    }
  }
};

/**
 * Open PDF in a new tab for viewing
 * @param {string} url - The URL of the PDF file
 * @param {Function} showError - Error toast function (optional)
 * @returns {boolean} - Success status
 */
export const openPDFInNewTab = (url, showError = null) => {
  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
    
    return true;
  } catch (error) {
    console.error('PDF open error:', error);
    
    if (showError) {
      showError(`Failed to open PDF: ${error.message}`);
    }
    
    return false;
  }
};

/**
 * Download multiple PDFs sequentially
 * @param {Array} downloads - Array of {url, filename} objects
 * @param {Function} showError - Error toast function (optional)
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Array>} - Array of success statuses
 */
export const downloadMultiplePDFs = async (downloads, showError = null, onProgress = null) => {
  const results = [];
  
  for (let i = 0; i < downloads.length; i++) {
    const { url, filename } = downloads[i];
    
    if (onProgress) {
      onProgress(i + 1, downloads.length, filename);
    }
    
    const success = await downloadPDF(url, filename, showError);
    results.push(success);
    
    // Add delay between downloads to avoid overwhelming the browser
    if (i < downloads.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};

/**
 * Validate PDF URL before download
 * @param {string} url - The URL to validate
 * @returns {Promise<boolean>} - Validation result
 */
export const validatePDFUrl = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    return contentType && (contentType.includes('application/pdf') || contentType.includes('pdf'));
  } catch (error) {
    console.error('PDF validation error:', error);
    return false;
  }
};

/**
 * Get PDF file size without downloading
 * @param {string} url - The URL of the PDF file
 * @returns {Promise<number|null>} - File size in bytes or null if unavailable
 */
export const getPDFFileSize = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch (error) {
    console.error('PDF size check error:', error);
    return null;
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

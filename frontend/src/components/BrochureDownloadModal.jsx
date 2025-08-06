import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaSpinner } from 'react-icons/fa';
import { selectModal, closeModal } from '../store/slices/uiSlice';
import { useDownloadBrochureMutation } from '../store/api/leadsApi';
import { useToast } from '../hooks/useToast';
import { downloadPDF } from '../utils/pdfDownload';

const BrochureDownloadModal = () => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();


  const modal = useSelector(selectModal('brochureDownload'));
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  const [downloadBrochure, { isLoading }] = useDownloadBrochureMutation();

  const handleClose = () => {
    dispatch(closeModal('brochureDownload'));
    setFormData({ name: '', mobile: '', email: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Mobile validation (10-digit Indian number)
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation (optional but must be at least 2 characters if provided)
    if (formData.name && formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show loading state
    const loadingToast = showSuccess('Processing your request...', { autoClose: false });
    
    try {
      // Prepare data with correct field names for backend
      const requestData = {
        projectId: modal.projectId,
        name: formData.name,
        email: formData.email,
        phone: formData.mobile, // Backend expects 'phone' not 'mobile'
        source: 'website',
        leadType: 'brochure_download'
      };

      console.log('Sending request with data:', requestData);
      
      const response = await downloadBrochure(requestData).unwrap();

      // Close loading toast
      if (loadingToast && typeof loadingToast.close === 'function') {
        loadingToast.close();
      }

      // Debug log the response
      console.log('Brochure download response:', response);

      // Check if we have a brochure URL in the response
      const brochureUrl = response.data?.brochureUrl || response.brochureUrl;
      const projectTitle = response.data?.projectTitle || response.projectTitle;

      if (brochureUrl) {
        try {
          // Ensure we have a proper URL (handle both relative and absolute)
          const fullBrochureUrl = brochureUrl.startsWith('http') 
            ? brochureUrl 
            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${brochureUrl}`;
            
          console.log('Attempting to download from URL:', fullBrochureUrl);
          
          await downloadPDF(
            fullBrochureUrl, 
            `${projectTitle || 'Brochure'}.pdf`,
            showError
          );
          
          showSuccess('Brochure download started!');
          handleClose();
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          showError('Failed to start download. Please try again.');
          // Don't close the modal on download error so user can retry
          return;
        }
      } else {
        console.error('No brochure URL in response:', response);
        showError('Brochure URL not found in the response. Please contact support.');
      }
    } catch (error) {
      console.error('Brochure download error:', error);
      
      // Close loading toast on error
      if (loadingToast && typeof loadingToast.close === 'function') {
        loadingToast.close();
      }
      
      // Show more detailed error message
      const errorMessage = error?.data?.message || 
                         error?.error || 
                         error?.message || 
                         'Failed to process your request. Please try again.';
      
      console.error('Full error details:', error);
      showError(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!modal.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Download Brochure
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {modal.projectTitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter your 10-digit mobile number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={10}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                By downloading this brochure, you agree to receive updates about this project. 
                Your information will be kept confidential and used only for project-related communications.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaDownload size={16} />
                    Download Brochure
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BrochureDownloadModal;

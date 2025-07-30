import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addToast } from '../store/slices/uiSlice';

export const useToast = () => {
  const dispatch = useDispatch();

  const showToast = (message, type = 'info', options = {}) => {
    const toastOptions = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    };

    // Show toast using react-toastify
    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
      default:
        toast.info(message, toastOptions);
        break;
    }

    // Also dispatch to Redux store for state management
    dispatch(addToast({
      message,
      type,
      timestamp: Date.now(),
    }));
  };

  const showSuccess = (message, options) => showToast(message, 'success', options);
  const showError = (message, options) => showToast(message, 'error', options);
  const showWarning = (message, options) => showToast(message, 'warning', options);
  const showInfo = (message, options) => showToast(message, 'info', options);

  // Helper for API responses
  const showApiResponse = (response, successMessage = 'Operation completed successfully') => {
    if (response?.success) {
      showSuccess(response.message || successMessage);
    } else {
      showError(response?.message || 'An error occurred');
    }
  };

  // Helper for API errors
  const showApiError = (error) => {
    let message = 'An unexpected error occurred';
    
    if (error?.data?.message) {
      message = error.data.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    showError(message);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApiResponse,
    showApiError,
  };
};

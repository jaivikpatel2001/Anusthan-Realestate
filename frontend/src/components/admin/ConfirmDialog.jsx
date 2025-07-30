import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiTrash2, FiInfo, FiCheckCircle } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, info, success
  isLoading = false,
  className = '',
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm && !isLoading) {
      onConfirm();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FiTrash2 size={24} />;
      case 'info':
        return <FiInfo size={24} />;
      case 'success':
        return <FiCheckCircle size={24} />;
      default:
        return <FiAlertTriangle size={24} />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'danger':
        return 'confirm-dialog-danger';
      case 'info':
        return 'confirm-dialog-info';
      case 'success':
        return 'confirm-dialog-success';
      default:
        return 'confirm-dialog-warning';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn btn-danger';
      case 'info':
        return 'btn btn-info';
      case 'success':
        return 'btn btn-success';
      default:
        return 'btn btn-warning';
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop confirm-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            className={`confirm-dialog ${getTypeClasses()} ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-dialog-content">
              <div className="confirm-dialog-icon">
                {getIcon()}
              </div>
              
              <div className="confirm-dialog-text">
                <h3 className="confirm-dialog-title">{title}</h3>
                <p className="confirm-dialog-message">{message}</p>
              </div>
            </div>

            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={getConfirmButtonClass()}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" color="white" showText={false} />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

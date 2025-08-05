import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner';

const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'medium', // small, medium, large, full
  showFooter = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Focus first input
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector('input, textarea, select');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      // Find the form inside the modal and trigger its submit event
      const form = modalRef.current?.querySelector('#modal-form');
      if (form) {
        // Create and dispatch a submit event
        const submitEvent = new Event('submit', { 
          bubbles: true, 
          cancelable: true 
        });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'modal-small';
      case 'large':
        return 'modal-large';
      case 'full':
        return 'modal-full';
      default:
        return 'modal-medium';
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
          className="modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className={`modal-container ${getSizeClasses()} ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                disabled={isLoading}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {children}
            </div>

            {/* Modal Footer */}
            {showFooter && (
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
                {onSubmit && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleFormSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" color="white" showText={false} />
                        Processing...
                      </>
                    ) : (
                      submitText
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormModal;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiType, FiFileText } from 'react-icons/fi';
import FormField from './FormField';

const MilestoneForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  showSubmitButton = true 
}) => {
  const [formData, setFormData] = useState({
    year: '',
    heading: '',
    description: '',
    icon: '',
    isActive: true,
    sortOrder: 0
  });

  const [errors, setErrors] = useState({});

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        year: initialData.year || '',
        heading: initialData.heading || '',
        description: initialData.description || '',
        icon: initialData.icon || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        sortOrder: initialData.sortOrder || 0
      });
    }
  }, [initialData]);

  // Handle input changes - consistent signature for all field types
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    } else if (formData.heading.length > 100) {
      newErrors.heading = 'Heading must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.sortOrder < 0 || formData.sortOrder > 999) {
      newErrors.sortOrder = 'Sort order must be between 0 and 999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear + 5; year >= 1990; year--) {
    yearOptions.push({
      value: year.toString(),
      label: year.toString()
    });
  }

  // Common icon options for milestones
  const iconOptions = [
    { value: '', label: 'No Icon' },
    { value: 'foundation', label: '🏗️ Foundation' },
    { value: 'growth', label: '📈 Growth' },
    { value: 'innovation', label: '💡 Innovation' },
    { value: 'award', label: '🏆 Award' },
    { value: 'expansion', label: '🌍 Expansion' },
    { value: 'milestone', label: '🎯 Milestone' },
    { value: 'achievement', label: '⭐ Achievement' },
    { value: 'launch', label: '🚀 Launch' },
    { value: 'partnership', label: '🤝 Partnership' },
    { value: 'certification', label: '📜 Certification' }
  ];

  return (
    <form id="modal-form" onSubmit={handleSubmit} className="milestone-form">
      <div className="form-grid">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Milestone Information</h3>
          
          <div className="form-row">
            <FormField
              label="Year"
              name="year"
              type="select"
              value={formData.year}
              onChange={handleInputChange}
              error={errors.year}
              required
              options={yearOptions}
            />

            <FormField
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={handleInputChange}
              error={errors.sortOrder}
              placeholder="Display order (0 = first)"
              min="0"
              max="999"
            />
          </div>

          <FormField
            label="Heading"
            name="heading"
            value={formData.heading}
            onChange={handleInputChange}
            error={errors.heading}
            required
            placeholder="e.g., Company Founded, First Major Project"
            maxLength="100"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            required
            placeholder="Describe this milestone and its significance..."
            rows={4}
            maxLength="500"
          />

          <FormField
            label="Icon"
            name="icon"
            type="select"
            value={formData.icon}
            onChange={handleInputChange}
            error={errors.icon}
            options={iconOptions}
          />
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3>Settings</h3>
          
          <FormField
            label="Active (visible on website)"
            name="isActive"
            type="checkbox"
            value={formData.isActive}
            onChange={handleInputChange}
          />

          {/* Preview */}
          <div className="milestone-preview">
            <h4>Preview</h4>
            <div className="preview-content">
              <div className="preview-year">{formData.year || 'YYYY'}</div>
              <div className="preview-heading">
                {formData.icon && (
                  <span className="preview-icon">
                    {iconOptions.find(opt => opt.value === formData.icon)?.label?.split(' ')[0] || ''}
                  </span>
                )}
                {formData.heading || 'Milestone Heading'}
              </div>
              <div className="preview-description">
                {formData.description || 'Milestone description will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Counters */}
      <div className="form-counters">
        <div className="counter">
          <span>Heading: {formData.heading.length}/100</span>
        </div>
        <div className="counter">
          <span>Description: {formData.description.length}/500</span>
        </div>
      </div>

      {/* Form Actions */}
      {showSubmitButton && (
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isLoading}
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Milestone' : 'Create Milestone'}
          </motion.button>
        </div>
      )}
    </form>
  );
};

export default MilestoneForm;
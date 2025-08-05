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

  // Handle input changes
  const handleInputChange = (e) => {
    // Handle both event objects and direct values from FormField
    const target = e?.target || e;
    const name = target?.name || (typeof e === 'string' ? arguments[0] : '');
    const value = target?.value || (typeof e === 'string' ? arguments[1] : target?.value || '');
    const type = target?.type || 'text';
    const checked = target?.checked || false;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    yearOptions.push(year);
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
    <form onSubmit={handleSubmit} className="milestone-form">
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
              required
              icon={<FiCalendar />}
            >
              <option value="">Select Year</option>
              {yearOptions.map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </FormField>

            <FormField
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={handleInputChange}
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
            required
            placeholder="e.g., Company Founded, First Major Project"
            maxLength={100}
            icon={<FiType />}
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Describe this milestone and its significance..."
            rows={4}
            maxLength={500}
            icon={<FiFileText />}
          />

          <FormField
            label="Icon"
            name="icon"
            type="select"
            value={formData.icon}
            onChange={handleInputChange}
            placeholder="Choose an icon (optional)"
          >
            {iconOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormField>
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3>Settings</h3>
          
          <div className="checkbox-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Active (visible on website)
            </label>
          </div>

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

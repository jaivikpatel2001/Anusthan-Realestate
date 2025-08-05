import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHash, FiType, FiBarChart } from 'react-icons/fi';
import FormField from './FormField';

const StatisticForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  showSubmitButton = true 
}) => {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    value: '',
    prefix: '',
    suffix: '',
    description: '',
    category: 'other',
    displayOrder: 0,
    isActive: true,
    showOnHomePage: false,
    showOnAboutPage: false,
    showOnFooter: false,
    icon: '',
    color: '#3B82F6',
    animationType: 'countup'
  });

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        key: initialData.key || '',
        label: initialData.label || '',
        value: initialData.value || '',
        prefix: initialData.prefix || '',
        suffix: initialData.suffix || '',
        description: initialData.description || '',
        category: initialData.category || 'other',
        displayOrder: initialData.displayOrder || 0,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        showOnHomePage: initialData.showOnHomePage || false,
        showOnAboutPage: initialData.showOnAboutPage || false,
        showOnFooter: initialData.showOnFooter || false,
        icon: initialData.icon || '',
        color: initialData.color || '#3B82F6',
        animationType: initialData.animationType || 'countup'
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleInputChange = (name, value) => {
    // Auto-generate key from label if creating new statistic
    if (name === 'label' && !initialData) {
      const autoKey = value.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      setFormData(prev => ({
        ...prev,
        label: value,
        key: autoKey
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  // Category options
  const categoryOptions = [
    { value: 'company', label: 'Company' },
    { value: 'projects', label: 'Projects' },
    { value: 'clients', label: 'Clients' },
    { value: 'experience', label: 'Experience' },
    { value: 'achievements', label: 'Achievements' },
    { value: 'other', label: 'Other' }
  ];

  // Animation type options
  const animationOptions = [
    { value: 'none', label: 'No Animation' },
    { value: 'countup', label: 'Count Up' },
    { value: 'fade', label: 'Fade In' },
    { value: 'slide', label: 'Slide In' }
  ];

  return (
    <form onSubmit={handleSubmit} className="statistic-form">
      <div className="form-grid">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <FormField
            label="Label"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            required
            placeholder="e.g., Years of Experience"
            icon={<FiType />}
          />

          <FormField
            label="Key"
            name="key"
            value={formData.key}
            onChange={handleInputChange}
            required
            placeholder="e.g., years_experience"
            help="Unique identifier (lowercase, underscores only)"
            icon={<FiHash />}
          />

          <div className="form-row">
            <FormField
              label="Prefix"
              name="prefix"
              value={formData.prefix}
              onChange={handleInputChange}
              placeholder="e.g., $, +"
            />

            <FormField
              label="Value"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              required
              placeholder="e.g., 15, 500, 98"
              icon={<FiBarChart />}
            />

            <FormField
              label="Suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleInputChange}
              placeholder="e.g., +, %, K"
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of this statistic..."
            rows={3}
          />
        </div>

        {/* Configuration */}
        <div className="form-section">
          <h3>Configuration</h3>
          
          <div className="form-row">
            <FormField
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormField>

            <FormField
              label="Display Order"
              name="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              max="999"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              placeholder="e.g., trophy, users, building"
            />

            <FormField
              label="Color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleInputChange}
            />
          </div>

          <FormField
            label="Animation Type"
            name="animationType"
            type="select"
            value={formData.animationType}
            onChange={handleInputChange}
          >
            {animationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormField>
        </div>

        {/* Display Locations */}
        <div className="form-section">
          <h3>Display Locations</h3>
          
          <div className="checkbox-group">
            <div className="checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showOnHomePage"
                  checked={formData.showOnHomePage}
                  onChange={(e) => handleInputChange('showOnHomePage', e.target.checked)}
                />
                <span className="checkmark"></span>
                Show on Home Page
              </label>
            </div>

            <div className="checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showOnAboutPage"
                  checked={formData.showOnAboutPage}
                  onChange={(e) => handleInputChange('showOnAboutPage', e.target.checked)}
                />
                <span className="checkmark"></span>
                Show on About Page
              </label>
            </div>

            <div className="checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showOnFooter"
                  checked={formData.showOnFooter}
                  onChange={(e) => handleInputChange('showOnFooter', e.target.checked)}
                />
                <span className="checkmark"></span>
                Show on Footer
              </label>
            </div>

            <div className="checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <span className="checkmark"></span>
                Active (visible on website)
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="form-section">
          <h3>Preview</h3>
          
          <div className="statistic-preview">
            <div className="preview-content">
              <div className="preview-value" style={{ color: formData.color }}>
                {formData.prefix}{formData.value || '0'}{formData.suffix}
              </div>
              <div className="preview-label">
                {formData.label || 'Statistic Label'}
              </div>
              {formData.description && (
                <div className="preview-description">
                  {formData.description}
                </div>
              )}
            </div>
          </div>
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
            {isLoading ? 'Saving...' : initialData ? 'Update Statistic' : 'Create Statistic'}
          </motion.button>
        </div>
      )}
    </form>
  );
};

export default StatisticForm;

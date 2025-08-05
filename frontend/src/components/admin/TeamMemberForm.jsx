import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import FormField from './FormField';
import { useUploadImageMutation } from '../../store/api/uploadApi';
import { useToast } from '../../hooks/useToast';

const TeamMemberForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  showSubmitButton = true 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    experienceYears: '',
    description: '',
    image: {
      url: '',
      publicId: '',
      alt: ''
    },
    email: '',
    phone: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    },
    specializations: [],
    achievements: [],
    isActive: true,
    sortOrder: 0
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [specializationInput, setSpecializationInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const [uploadImage, { isLoading: uploadLoading }] = useUploadImageMutation();
  const { showError } = useToast();

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        position: initialData.position || '',
        experienceYears: initialData.experienceYears || '',
        description: initialData.description || '',
        image: {
          url: initialData.image?.url || '',
          publicId: initialData.image?.publicId || '',
          alt: initialData.image?.alt || ''
        },
        email: initialData.email || '',
        phone: initialData.phone || '',
        socialLinks: {
          linkedin: initialData.socialLinks?.linkedin || '',
          twitter: initialData.socialLinks?.twitter || '',
          facebook: initialData.socialLinks?.facebook || '',
          instagram: initialData.socialLinks?.instagram || ''
        },
        specializations: initialData.specializations || [],
        achievements: initialData.achievements || [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        sortOrder: initialData.sortOrder || 0
      });
      setImagePreview(initialData.image?.url || '');
    }
  }, [initialData]);

  // Handle input changes
  const handleInputChange = (name, value) => {
    // use name and value directly
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageFile) return formData.image.url;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);
      uploadFormData.append('folder', 'team-members');

      const result = await uploadImage(uploadFormData).unwrap();
      return result.url;
    } catch (error) {
      showError('Failed to upload image');
      throw error;
    }
  };

  // Add specialization
  const addSpecialization = () => {
    if (specializationInput.trim() && !formData.specializations.includes(specializationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, specializationInput.trim()]
      }));
      setSpecializationInput('');
    }
  };

  // Remove specialization
  const removeSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  // Add achievement
  const addAchievement = () => {
    if (achievementInput.trim() && !formData.achievements.includes(achievementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput('');
    }
  };

  // Remove achievement
  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image.url;
      
      // Upload image if new file selected
      if (imageFile) {
        imageUrl = await handleImageUpload();
      }

      const submitData = {
        ...formData,
        image: {
          ...formData.image,
          url: imageUrl
        }
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="team-member-form">
      <div className="form-grid">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter full name"
          />

          <FormField
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
            placeholder="e.g., CEO & Founder"
          />

          <FormField
            label="Experience Years"
            name="experienceYears"
            type="number"
            value={formData.experienceYears}
            onChange={handleInputChange}
            required
            min="0"
            max="50"
            placeholder="Years of experience"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Brief description about the team member"
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div className="form-section">
          <h3>Profile Image</h3>
          
          <div className="image-upload-section">
            <div className="image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="preview-img" />
              ) : (
                <div className="preview-placeholder">
                  <FiUpload size={48} />
                  <p>No image selected</p>
                </div>
              )}
            </div>
            
            <div className="upload-controls">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="btn btn-outline">
                <FiUpload size={16} />
                Choose Image
              </label>
              <small>Max size: 5MB. Recommended: 400x400px</small>
            </div>
          </div>

          <FormField
            label="Image Alt Text"
            name="image.alt"
            value={formData.image.alt}
            onChange={handleInputChange}
            placeholder="Alternative text for the image"
          />
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
          />

          <FormField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="10-digit mobile number"
          />
        </div>

        {/* Social Links */}
        <div className="form-section">
          <h3>Social Links</h3>
          
          <FormField
            label="LinkedIn"
            name="socialLinks.linkedin"
            value={formData.socialLinks.linkedin}
            onChange={handleInputChange}
            placeholder="LinkedIn profile URL"
          />

          <FormField
            label="Twitter"
            name="socialLinks.twitter"
            value={formData.socialLinks.twitter}
            onChange={handleInputChange}
            placeholder="Twitter profile URL"
          />
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3>Settings</h3>
          
          <FormField
            label="Sort Order"
            name="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={handleInputChange}
            placeholder="Display order (0 = first)"
          />

          <div className="checkbox-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={e => handleInputChange("isActive", e.target.checked)}
              />
              <span className="checkmark"></span>
              Active (visible on website)
            </label>
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
            disabled={isLoading || uploadLoading}
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || uploadLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading || uploadLoading ? 'Saving...' : initialData ? 'Update Team Member' : 'Create Team Member'}
          </motion.button>
        </div>
      )}
    </form>
  );
};

export default TeamMemberForm;

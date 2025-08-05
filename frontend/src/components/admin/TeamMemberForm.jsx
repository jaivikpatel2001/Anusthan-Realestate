import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import FormField from './FormField';
import { useUploadImageMutation } from '../../store/api/uploadApi';
import { useToast } from '../../hooks/useToast';
import { selectCurrentUser } from '../../store/slices/authSlice';

const TeamMemberForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  showSubmitButton = true 
}) => {
  const currentUser = useSelector(selectCurrentUser);
  
  // Debug: Log current user and auth state
  useEffect(() => {
    console.log('Current user from Redux:', currentUser);
    console.log('User object keys:', currentUser ? Object.keys(currentUser) : 'No user');
    console.log('Is user authenticated?', !!(currentUser?._id || currentUser?.id));
  }, [currentUser]);
  
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
    sortOrder: 0,
    createdBy: currentUser?._id || ''
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
        sortOrder: initialData.sortOrder || 0,
        createdBy: initialData.createdBy || currentUser?._id || ''
      });
      setImagePreview(initialData.image?.url || '');
    } else if (currentUser?._id) {
      // For new records, ensure createdBy is set
      setFormData(prev => ({
        ...prev,
        createdBy: currentUser._id
      }));
    }
  }, [initialData, currentUser]);

  // Handle input changes
  const handleInputChange = (name, value) => {
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

  // Remove image
  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image: {
        url: '',
        publicId: '',
        alt: ''
      }
    }));
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
      // Debug: Log current user at submission time
      console.log('Form submission - current user:', currentUser);
      
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) {
        console.error('No user ID found in Redux store. User object:', currentUser);
        throw new Error('User not authenticated - please log in again');
      }

      let imageUrl = formData.image.url;
      
      // Upload image if new file selected
      if (imageFile) {
        imageUrl = await handleImageUpload();
      }

      // Prepare the data with proper types and structure
      const submitData = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        experienceYears: Number(formData.experienceYears) || 0,
        description: formData.description.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 0,
        createdBy: currentUser._id || currentUser.id,
        image: {
          url: imageUrl,
          publicId: formData.image.publicId || '',
          alt: formData.image.alt || ''
        },
        socialLinks: {
          linkedin: formData.socialLinks.linkedin || '',
          twitter: formData.socialLinks.twitter || '',
          facebook: formData.socialLinks.facebook || '',
          instagram: formData.socialLinks.instagram || ''
        },
        specializations: formData.specializations || [],
        achievements: formData.achievements || []
      };
      
      // Remove empty strings from arrays
      submitData.specializations = submitData.specializations.filter(item => item.trim() !== '');
      submitData.achievements = submitData.achievements.filter(item => item.trim() !== '');

      console.log('Submitting team member data:', JSON.stringify(submitData, null, 2));
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      showError(error?.message || error?.data?.message || 'Failed to save team member. Please try again.');
    }
  };

  return (
    <form id="modal-form" onSubmit={handleSubmit} className="team-member-form">
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

        {/* Image Upload Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {imagePreview ? (
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    title="Remove image"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <FiUpload className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                {imagePreview ? 'Change' : 'Upload Image'}
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Recommended: 400×400px (1:1 ratio)
              </p>
            </div>
          </div>
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

        {/* Specializations */}
        <div className="form-section">
          <h3>Specializations</h3>
          
          <div className="tag-input-section">
            <div className="tag-input">
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                placeholder="Add specialization..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <button
                type="button"
                onClick={addSpecialization}
                className="add-tag-btn"
              >
                Add
              </button>
            </div>
            
            <div className="tags-list">
              {formData.specializations.map((spec, index) => (
                <span key={index} className="tag">
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="remove-tag-btn"
                  >
                    <FiX size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="form-section">
          <h3>Achievements</h3>
          
          <div className="tag-input-section">
            <div className="tag-input">
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                placeholder="Add achievement..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
              />
              <button
                type="button"
                onClick={addAchievement}
                className="add-tag-btn"
              >
                Add
              </button>
            </div>
            
            <div className="tags-list">
              {formData.achievements.map((achievement, index) => (
                <span key={index} className="tag">
                  {achievement}
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="remove-tag-btn"
                  >
                    <FiX size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
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
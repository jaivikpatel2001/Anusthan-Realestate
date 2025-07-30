import { useState, useEffect } from 'react';
import { FormField } from './index';
import { useToast } from '../../hooks/useToast';

const UserForm = ({ 
  user = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  isEdit = false 
}) => {
  const { showError } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    avatar: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Populate form with existing user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password for security
        confirmPassword: '',
        role: user.role || 'user',
        avatar: user.avatar || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user]);

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

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!isEdit && !formData.password) newErrors.password = 'Password is required';
    if (!formData.role) newErrors.role = 'Role is required';

    // Name validation
    if (formData.name && (formData.name.length < 2 || formData.name.length > 50)) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }

    // Email validation
    if (formData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    // Password validation (only for new users or when password is provided)
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
      
      // Strong password validation
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the validation errors');
      return;
    }

    // Prepare data for submission
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      isActive: formData.isActive
    };

    // Only include password if it's provided
    if (formData.password) {
      submitData.password = formData.password;
    }

    // Only include avatar if it's provided
    if (formData.avatar.trim()) {
      submitData.avatar = formData.avatar.trim();
    }

    onSubmit(submitData);
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-grid">
        {/* Basic Information */}
        <div className="form-section">
          <h3>User Information</h3>
          
          <FormField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
            placeholder="Enter full name"
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
            placeholder="Enter email address"
          />

          <FormField
            label="Avatar URL"
            name="avatar"
            value={formData.avatar}
            onChange={handleInputChange}
            error={errors.avatar}
            placeholder="https://example.com/avatar.jpg"
            helpText="Optional: URL to user's profile picture"
          />
        </div>

        {/* Password Section */}
        <div className="form-section">
          <h3>{isEdit ? 'Change Password (Optional)' : 'Password'}</h3>
          
          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required={!isEdit}
            placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
            helpText={isEdit ? "Only fill this if you want to change the password" : "Must be at least 6 characters with uppercase, lowercase, and number"}
          />

          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            required={!isEdit && formData.password}
            placeholder="Confirm password"
            disabled={!formData.password}
          />
        </div>

        {/* Role and Settings */}
        <div className="form-section">
          <h3>Role & Settings</h3>
          
          <FormField
            label="Role"
            name="role"
            type="select"
            value={formData.role}
            onChange={handleInputChange}
            error={errors.role}
            options={roleOptions}
            required
            helpText="Admin users have full access to the admin dashboard"
          />

          <FormField
            label="Active"
            name="isActive"
            type="checkbox"
            value={formData.isActive}
            onChange={handleInputChange}
            error={errors.isActive}
            helpText="Inactive users cannot log in to the system"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
        </button>
      </div>
    </form>
  );
};

export default UserForm;

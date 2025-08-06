import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FormField } from './index';
import { useToast } from '../../hooks/useToast';
import { selectCurrentToken } from '../../store/slices/authSlice';

const ProjectForm = ({ 
  project = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  showSubmitButton = true // New prop to control submit button visibility
}) => {
  const { showError, showSuccess } = useToast();
  const token = useSelector(selectCurrentToken);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    location: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    coordinates: {
      latitude: '',
      longitude: ''
    },
    status: 'upcoming',
    category: 'residential',
    startingPrice: '',
    maxPrice: '',
    totalUnits: '',
    availableUnits: '',
    heroImage: '',
    images: [], // Added this field
    brochure: null, // Added this field
    features: [],
    amenities: [],
    specifications: {
      totalFloors: '',
      parkingSpaces: '',
      elevators: '',
      constructionArea: '',
      landArea: '',
      approvals: []
    },
    timeline: {
      startDate: '',
      expectedCompletion: '',
      actualCompletion: ''
    },
    progress: 0,
    developer: {
      name: '',
      contact: '',
      email: '',
      website: ''
    },
    seoData: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    isActive: true,
    isFeatured: false
  });

  const [errors, setErrors] = useState({});
  const [newFeature, setNewFeature] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [newAmenityIcon, setNewAmenityIcon] = useState('');
  const [newAmenityDescription, setNewAmenityDescription] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newApproval, setNewApproval] = useState('');

  // Populate form with existing project data
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        shortDescription: project.shortDescription || '',
        location: project.location || '',
        address: {
          street: project.address?.street || '',
          city: project.address?.city || '',
          state: project.address?.state || '',
          zipCode: project.address?.zipCode || '',
          country: project.address?.country || 'India'
        },
        coordinates: {
          latitude: project.coordinates?.latitude || '',
          longitude: project.coordinates?.longitude || ''
        },
        status: project.status || 'upcoming',
        category: project.category || 'residential',
        startingPrice: project.startingPrice || '',
        maxPrice: project.maxPrice || '',
        totalUnits: project.totalUnits || '',
        availableUnits: project.availableUnits || '',
        heroImage: project.heroImage || '',
        images: project.images || [], // Populate images array
        brochure: project.brochure || null, // Populate brochure object
        features: project.features || [],
        amenities: project.amenities || [],
        specifications: {
          totalFloors: project.specifications?.totalFloors || '',
          parkingSpaces: project.specifications?.parkingSpaces || '',
          elevators: project.specifications?.elevators || '',
          constructionArea: project.specifications?.constructionArea || '',
          landArea: project.specifications?.landArea || '',
          approvals: project.specifications?.approvals || []
        },
        timeline: {
          startDate: project.timeline?.startDate ? new Date(project.timeline.startDate).toISOString().split('T')[0] : '',
          expectedCompletion: project.timeline?.expectedCompletion ? new Date(project.timeline.expectedCompletion).toISOString().split('T')[0] : '',
          actualCompletion: project.timeline?.actualCompletion ? new Date(project.timeline.actualCompletion).toISOString().split('T')[0] : ''
        },
        progress: project.progress || 0,
        developer: {
          name: project.developer?.name || '',
          contact: project.developer?.contact || '',
          email: project.developer?.email || '',
          website: project.developer?.website || ''
        },
        seoData: {
          metaTitle: project.seoData?.metaTitle || '',
          metaDescription: project.seoData?.metaDescription || '',
          keywords: project.seoData?.keywords || []
        },
        isActive: project.isActive !== undefined ? project.isActive : true,
        isFeatured: project.isFeatured || false
      });
    }
  }, [project]);

  const handleInputChange = (name, value) => {
    // Handle nested object updates
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
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.heroImage.trim()) newErrors.heroImage = 'Hero image is required';

    // Numeric validations
    if (formData.startingPrice && formData.startingPrice < 0) {
      newErrors.startingPrice = 'Starting price cannot be negative';
    }
    if (formData.maxPrice && formData.maxPrice < 0) {
      newErrors.maxPrice = 'Max price cannot be negative';
    }
    if (formData.totalUnits && formData.totalUnits < 1) {
      newErrors.totalUnits = 'Total units must be at least 1';
    }
    if (formData.availableUnits && formData.availableUnits < 0) {
      newErrors.availableUnits = 'Available units cannot be negative';
    }
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    // Coordinate validations
    if (formData.coordinates.latitude && (formData.coordinates.latitude < -90 || formData.coordinates.latitude > 90)) {
      newErrors['coordinates.latitude'] = 'Latitude must be between -90 and 90';
    }
    if (formData.coordinates.longitude && (formData.coordinates.longitude < -180 || formData.coordinates.longitude > 180)) {
      newErrors['coordinates.longitude'] = 'Longitude must be between -180 and 180';
    }

    // Email validation
    if (formData.developer.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.developer.email)) {
      newErrors['developer.email'] = 'Please provide a valid email';
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
      ...formData,
      startingPrice: formData.startingPrice ? Number(formData.startingPrice) : undefined,
      maxPrice: formData.maxPrice ? Number(formData.maxPrice) : undefined,
      totalUnits: formData.totalUnits ? Number(formData.totalUnits) : undefined,
      availableUnits: formData.availableUnits ? Number(formData.availableUnits) : undefined,
      progress: Number(formData.progress),
      coordinates: {
        latitude: formData.coordinates.latitude ? Number(formData.coordinates.latitude) : undefined,
        longitude: formData.coordinates.longitude ? Number(formData.coordinates.longitude) : undefined
      },
      specifications: {
        ...formData.specifications,
        totalFloors: formData.specifications.totalFloors ? Number(formData.specifications.totalFloors) : undefined,
        parkingSpaces: formData.specifications.parkingSpaces ? Number(formData.specifications.parkingSpaces) : undefined,
        elevators: formData.specifications.elevators ? Number(formData.specifications.elevators) : undefined,
        constructionArea: formData.specifications.constructionArea ? Number(formData.specifications.constructionArea) : undefined,
        landArea: formData.specifications.landArea ? Number(formData.specifications.landArea) : undefined
      }
    };

    // Sanitize the data to remove any DOM elements or File objects
    const sanitizedData = sanitizeData(submitData);

    onSubmit(sanitizedData);
  };

  const addArrayItem = (arrayName, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], value.trim()]
      }));
      setter('');
    }
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const addNestedArrayItem = (parentName, arrayName, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [parentName]: {
          ...prev[parentName],
          [arrayName]: [...prev[parentName][arrayName], value.trim()]
        }
      }));
      setter('');
    }
  };

  const removeNestedArrayItem = (parentName, arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [parentName]: {
        ...prev[parentName],
        [arrayName]: prev[parentName][arrayName].filter((_, i) => i !== index)
      }
    }));
  };

  // Amenity handling functions
  const addAmenity = () => {
    if (newAmenity.trim()) {
      const amenityObj = {
        name: newAmenity.trim(),
        icon: newAmenityIcon.trim() || undefined,
        description: newAmenityDescription.trim() || undefined
      };

      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityObj]
      }));

      // Clear the input fields
      setNewAmenity('');
      setNewAmenityIcon('');
      setNewAmenityDescription('');
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  // Image upload handling
  const handleImageUpload = async (name, files) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showError('Please select a valid image file (JPG, PNG, WebP)');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showError('File size must be less than 10MB');
        return;
      }

      // Create FormData for upload
      const uploadData = new FormData();
      // Use the actual File object, not the serialized version
      const actualFile = file._file || file;
      uploadData.append('images', actualFile);

      try {
        showSuccess('Uploading image...');

        // Upload to backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const headers = {
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`${apiUrl}/upload/project-images`, {
          method: 'POST',
          headers,
          body: uploadData,
          credentials: 'include'
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (result.data && result.data.length > 0) {
            // Update the heroImage field with the uploaded image URL
            const imageUrl = `${import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'}${result.data[0].url}`;
            setFormData(prev => ({
              ...prev,
              heroImage: imageUrl
            }));
            showSuccess('Image uploaded successfully!');
          } else {
            throw new Error('No image URL returned from server');
          }
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        showError(error.message || 'Failed to upload image. Please try again.');
      }
    }
  };

  // Multiple images upload handling
  const handleMultipleImagesUpload = async (name, files) => {
    console.log('Multiple images upload triggered:', { name, files, filesLength: files?.length });

    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];
      const file = fileObj._file || fileObj; // Handle both File objects and our custom objects

      console.log(`Validating file ${i + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        isFile: file instanceof File
      });

      if (!allowedTypes.includes(file.type)) {
        showError(`${file.name}: Please select valid image files (JPG, PNG, WebP)`);
        return;
      }
      if (file.size > maxSize) {
        showError(`${file.name}: File size must be less than 10MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      showError('No valid files to upload');
      return;
    }

    try {
      console.log(`Starting upload of ${validFiles.length} images...`);
      showSuccess(`Uploading ${validFiles.length} images...`);

      // Create FormData for upload
      const uploadData = new FormData();
      validFiles.forEach((file, index) => {
        console.log(`Adding file ${index + 1} to FormData:`, file.name);
        uploadData.append('images', file);
      });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      console.log('Making upload request to:', `${apiUrl}/upload/project-images`);

      const response = await fetch(`${apiUrl}/upload/project-images`, {
        method: 'POST',
        headers,
        body: uploadData,
        credentials: 'include'
      });

      console.log('Upload response status:', response.status);
      const result = await response.json();
      console.log('Upload response data:', result);

      if (response.ok && result.success) {
        if (result.data && result.data.length > 0) {
          // Add new images to existing images
          const newImages = result.data.map(img => ({
            url: `${import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'}${img.url}`,
            publicId: img.publicId,
            caption: '',
            isHero: false
          }));

          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newImages]
          }));
          showSuccess(`${result.data.length} images uploaded successfully!`);
          console.log('Images added to form data:', newImages);
        } else {
          throw new Error('No image URLs returned from server');
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Multiple images upload error:', error);
      showError(error.message || 'Failed to upload images. Please try again.');
    }
  };

  // Brochure upload handling
  // Enhanced brochure upload handling with better validation
  const handleBrochureUpload = async (name, files) => {
    console.log('Brochure upload triggered:', { name, files, filesLength: files?.length });

    if (!files || files.length === 0) {
      console.log('No brochure file selected');
      return;
    }

    const file = files[0];
    const actualFile = file._file || file;

    console.log('Validating brochure file:', {
      name: actualFile.name,
      type: actualFile.type,
      size: actualFile.size
    });

    // Validate file type
    if (actualFile.type !== 'application/pdf') {
      showError('Please select a PDF file for the brochure');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (actualFile.size > maxSize) {
      showError(`File size must be less than 10MB (${(actualFile.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    try {
      showSuccess('Uploading brochure...');

      const uploadData = new FormData();
      uploadData.append('brochure', actualFile);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      console.log('Making brochure upload request to:', `${apiUrl}/upload/brochures`);

      const response = await fetch(`${apiUrl}/upload/brochures`, {
        method: 'POST',
        headers,
        body: uploadData,
        credentials: 'include'
      });

      console.log('Brochure upload response status:', response.status);
      const result = await response.json();
      console.log('Brochure upload response data:', result);

      if (response.ok && result.success) {
        if (result.data) {
          const brochureUrl = `${import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'}${result.data.url}`;
          setFormData(prev => ({
            ...prev,
            brochure: {
              url: brochureUrl,
              publicId: result.data.publicId,
              filename: result.data.originalName || actualFile.name
            }
          }));
          showSuccess('Brochure uploaded successfully!');
          console.log('Brochure added to form data:', result.data);
        } else {
          throw new Error('No brochure URL returned from server');
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Brochure upload error:', error);
      showError(error.message || 'Failed to upload brochure. Please try again.');
    }
  };

  // Remove project image
  // Enhanced remove project image function with better state management
  const removeProjectImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
    showSuccess('Image removed successfully');
  };

  // Enhanced remove brochure function
  const removeBrochure = () => {
    setFormData(prev => ({ 
      ...prev, 
      brochure: null 
    }));
    showSuccess('Brochure removed successfully');
  };

  // Enhanced sanitize data function to handle images and brochure properly
  const sanitizeData = (obj) => {
    if (obj === null || obj === undefined) return obj;

    // Check if it's a DOM element or File object
    if (obj instanceof Element || obj instanceof File || obj instanceof FileList) {
      return null;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeData(item)).filter(item => item !== null);
    }

    // Handle objects
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip the _file property which contains the actual File object
        if (key === '_file') {
          continue;
        }
        const sanitizedValue = sanitizeData(value);
        if (sanitizedValue !== null) {
          sanitized[key] = sanitizedValue;
        }
      }
      return sanitized;
    }

    // Return primitive values as-is
    return obj;
  };

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' }
  ];

  const categoryOptions = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'mixed', label: 'Mixed' }
  ];

  return (
    <form id="modal-form" onSubmit={handleSubmit} className="project-form">
      <div className="form-grid">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <FormField
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            required
            placeholder="Enter project title"
          />

          <FormField
            label="Short Description"
            name="shortDescription"
            type="textarea"
            rows={3}
            value={formData.shortDescription}
            onChange={handleInputChange}
            error={errors.shortDescription}
            placeholder="Brief description for listings"
          />

          <FormField
            label="Full Description"
            name="description"
            type="textarea"
            rows={6}
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            required
            placeholder="Detailed project description"
          />

          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            error={errors.location}
            required
            placeholder="Project location"
          />

          <div className="form-row">
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleInputChange}
              error={errors.status}
              options={statusOptions}
              required
            />

            <FormField
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleInputChange}
              error={errors.category}
              options={categoryOptions}
              required
            />
          </div>

          <div className="image-upload-section">
            <FormField
              label="Hero Image"
              name="heroImageFile"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              error={errors.heroImage}
              //required
              helpText="Upload an image file (JPG, PNG, WebP). Maximum size: 10MB"
            />

            {formData.heroImage && (
              <div className="uploaded-image-preview">
                <img
                  src={formData.heroImage}
                  alt="Hero image preview"
                  className="image-preview"
                />
                <p className="image-url">Uploaded: {formData.heroImage}</p>
              </div>
            )}
          </div>

          {/* Multiple Project Images */}
          <div className="image-upload-section">
            <FormField
              label="Project Images"
              name="projectImages"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple={true}
              onChange={handleMultipleImagesUpload}
              helpText="Upload multiple project images (JPG, PNG, WebP). Maximum size: 10MB each"
            />

            {formData.images && formData.images.length > 0 && (
              <div className="multiple-images-preview">
                <h4>Project Images ({formData.images.length})</h4>
                <div className="images-grid">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img
                        src={image.url}
                        alt={`Project image ${index + 1}`}
                        className="image-preview"
                      />
                      <button
                        type="button"
                        onClick={() => removeProjectImage(index)}
                        className="remove-image-btn"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Brochure Upload */}
          <div className="image-upload-section">
            <FormField
              label="Project Brochure"
              name="brochureFile"
              type="file"
              accept="application/pdf"
              onChange={handleBrochureUpload}
              helpText="Upload project brochure (PDF only). Maximum size: 10MB"
            />

            {formData.brochure && formData.brochure.url && (
              <div className="uploaded-file-preview">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <a href={formData.brochure.url} target="_blank" rel="noopener noreferrer" className="file-name-link">
                    <p className="file-name">{formData.brochure.filename || 'Project Brochure'}</p>
                  </a>
                    <p className="file-url">Uploaded: {formData.brochure.url}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, brochure: null }))}
                  className="remove-file-btn"
                  title="Remove brochure"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Details</h3>

          <FormField
            label="Street Address"
            name="address.street"
            value={formData.address.street}
            onChange={handleInputChange}
            error={errors['address.street']}
            placeholder="Street address"
          />

          <div className="form-row">
            <FormField
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              error={errors['address.city']}
              placeholder="City"
            />

            <FormField
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              error={errors['address.state']}
              placeholder="State"
            />
          </div>

          <div className="form-row">
            <FormField
              label="ZIP Code"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              error={errors['address.zipCode']}
              placeholder="ZIP Code"
            />

            <FormField
              label="Country"
              name="address.country"
              value={formData.address.country}
              onChange={handleInputChange}
              error={errors['address.country']}
              placeholder="Country"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Latitude"
              name="coordinates.latitude"
              type="number"
              step="any"
              value={formData.coordinates.latitude}
              onChange={handleInputChange}
              error={errors['coordinates.latitude']}
              placeholder="Latitude (-90 to 90)"
            />

            <FormField
              label="Longitude"
              name="coordinates.longitude"
              type="number"
              step="any"
              value={formData.coordinates.longitude}
              onChange={handleInputChange}
              error={errors['coordinates.longitude']}
              placeholder="Longitude (-180 to 180)"
            />
          </div>
        </div>

        {/* Pricing & Units */}
        <div className="form-section">
          <h3>Pricing & Units</h3>

          <div className="form-row">
            <FormField
              label="Starting Price"
              name="startingPrice"
              type="number"
              min="0"
              value={formData.startingPrice}
              onChange={handleInputChange}
              error={errors.startingPrice}
              placeholder="Starting price"
            />

            <FormField
              label="Maximum Price"
              name="maxPrice"
              type="number"
              min="0"
              value={formData.maxPrice}
              onChange={handleInputChange}
              error={errors.maxPrice}
              placeholder="Maximum price"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Total Units"
              name="totalUnits"
              type="number"
              min="1"
              value={formData.totalUnits}
              onChange={handleInputChange}
              error={errors.totalUnits}
              placeholder="Total units"
            />

            <FormField
              label="Available Units"
              name="availableUnits"
              type="number"
              min="0"
              value={formData.availableUnits}
              onChange={handleInputChange}
              error={errors.availableUnits}
              placeholder="Available units"
            />
          </div>

          <FormField
            label="Progress (%)"
            name="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleInputChange}
            error={errors.progress}
            placeholder="Project progress percentage"
          />
        </div>

        {/* Features */}
        <div className="form-section">
          <h3>Features</h3>

          <div className="array-input">
            <div className="array-input-row">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature"
                className="form-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('features', newFeature, setNewFeature);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addArrayItem('features', newFeature, setNewFeature)}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>

            <div className="array-items">
              {formData.features.map((feature, index) => (
                <div key={index} className="array-item">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('features', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="form-section">
          <h3>Amenities</h3>

          <div className="amenity-input">
            <div className="form-row">
              <FormField
                label="Amenity Name"
                name="amenityName"
                value={newAmenity}
                onChange={(name, value) => setNewAmenity(value)}
                placeholder="e.g., Swimming Pool"
                className="flex-1"
              />
              <FormField
                label="Icon (optional)"
                name="amenityIcon"
                value={newAmenityIcon}
                onChange={(name, value) => setNewAmenityIcon(value)}
                placeholder="e.g., 🏊‍♂️ or icon-class"
                className="flex-1"
              />
            </div>

            <FormField
              label="Description (optional)"
              name="amenityDescription"
              type="textarea"
              rows={2}
              value={newAmenityDescription}
              onChange={(name, value) => setNewAmenityDescription(value)}
              placeholder="Brief description of the amenity"
            />

            <button
              type="button"
              onClick={addAmenity}
              className="btn btn-secondary"
              disabled={!newAmenity.trim()}
            >
              Add Amenity
            </button>
          </div>

          <div className="amenity-items">
            {formData.amenities.map((amenity, index) => (
              <div key={index} className="amenity-item">
                <div className="amenity-content">
                  <div className="amenity-header">
                    {amenity.icon && <span className="amenity-icon">{amenity.icon}</span>}
                    <span className="amenity-name">{amenity.name}</span>
                  </div>
                  {amenity.description && (
                    <p className="amenity-description">{amenity.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="remove-btn"
                  title="Remove amenity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="form-section">
          <h3>Specifications</h3>

          <div className="form-row">
            <FormField
              label="Total Floors"
              name="specifications.totalFloors"
              type="number"
              min="0"
              value={formData.specifications.totalFloors}
              onChange={handleInputChange}
              error={errors['specifications.totalFloors']}
              placeholder="Number of floors"
            />

            <FormField
              label="Parking Spaces"
              name="specifications.parkingSpaces"
              type="number"
              min="0"
              value={formData.specifications.parkingSpaces}
              onChange={handleInputChange}
              error={errors['specifications.parkingSpaces']}
              placeholder="Number of parking spaces"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Elevators"
              name="specifications.elevators"
              type="number"
              min="0"
              value={formData.specifications.elevators}
              onChange={handleInputChange}
              error={errors['specifications.elevators']}
              placeholder="Number of elevators"
            />

            <FormField
              label="Construction Area (sq ft)"
              name="specifications.constructionArea"
              type="number"
              min="0"
              value={formData.specifications.constructionArea}
              onChange={handleInputChange}
              error={errors['specifications.constructionArea']}
              placeholder="Construction area"
            />
          </div>

          <FormField
            label="Land Area (sq ft)"
            name="specifications.landArea"
            type="number"
            min="0"
            value={formData.specifications.landArea}
            onChange={handleInputChange}
            error={errors['specifications.landArea']}
            placeholder="Land area"
          />

          <div className="array-input">
            <label>Approvals</label>
            <div className="array-input-row">
              <input
                type="text"
                value={newApproval}
                onChange={(e) => setNewApproval(e.target.value)}
                placeholder="Add an approval"
                className="form-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNestedArrayItem('specifications', 'approvals', newApproval, setNewApproval);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addNestedArrayItem('specifications', 'approvals', newApproval, setNewApproval)}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>

            <div className="array-items">
              {formData.specifications.approvals.map((approval, index) => (
                <div key={index} className="array-item">
                  <span>{approval}</span>
                  <button
                    type="button"
                    onClick={() => removeNestedArrayItem('specifications', 'approvals', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="form-section">
          <h3>Timeline</h3>

          <div className="form-row">
            <FormField
              label="Start Date"
              name="timeline.startDate"
              type="date"
              value={formData.timeline.startDate}
              onChange={handleInputChange}
              error={errors['timeline.startDate']}
            />

            <FormField
              label="Expected Completion"
              name="timeline.expectedCompletion"
              type="date"
              value={formData.timeline.expectedCompletion}
              onChange={handleInputChange}
              error={errors['timeline.expectedCompletion']}
            />
          </div>

          <FormField
            label="Actual Completion"
            name="timeline.actualCompletion"
            type="date"
            value={formData.timeline.actualCompletion}
            onChange={handleInputChange}
            error={errors['timeline.actualCompletion']}
          />
        </div>

        {/* Developer Information */}
        <div className="form-section">
          <h3>Developer Information</h3>

          <FormField
            label="Developer Name"
            name="developer.name"
            value={formData.developer.name}
            onChange={handleInputChange}
            error={errors['developer.name']}
            placeholder="Developer company name"
          />

          <div className="form-row">
            <FormField
              label="Contact Number"
              name="developer.contact"
              value={formData.developer.contact}
              onChange={handleInputChange}
              error={errors['developer.contact']}
              placeholder="Contact number"
            />

            <FormField
              label="Email"
              name="developer.email"
              type="email"
              value={formData.developer.email}
              onChange={handleInputChange}
              error={errors['developer.email']}
              placeholder="Email address"
            />
          </div>

          <FormField
            label="Website"
            name="developer.website"
            value={formData.developer.website}
            onChange={handleInputChange}
            error={errors['developer.website']}
            placeholder="https://developer-website.com"
          />
        </div>

        {/* SEO Data */}
        <div className="form-section">
          <h3>SEO Settings</h3>

          <FormField
            label="Meta Title"
            name="seoData.metaTitle"
            value={formData.seoData.metaTitle}
            onChange={handleInputChange}
            error={errors['seoData.metaTitle']}
            placeholder="SEO meta title"
          />

          <FormField
            label="Meta Description"
            name="seoData.metaDescription"
            type="textarea"
            rows={3}
            value={formData.seoData.metaDescription}
            onChange={handleInputChange}
            error={errors['seoData.metaDescription']}
            placeholder="SEO meta description"
          />

          <div className="array-input">
            <label>Keywords</label>
            <div className="array-input-row">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add a keyword"
                className="form-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNestedArrayItem('seoData', 'keywords', newKeyword, setNewKeyword);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addNestedArrayItem('seoData', 'keywords', newKeyword, setNewKeyword)}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>

            <div className="array-items">
              {formData.seoData.keywords.map((keyword, index) => (
                <div key={index} className="array-item">
                  <span>{keyword}</span>
                  <button
                    type="button"
                    onClick={() => removeNestedArrayItem('seoData', 'keywords', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3>Settings</h3>

          <div className="form-row">
            <FormField
              label="Active"
              name="isActive"
              type="checkbox"
              value={formData.isActive}
              onChange={handleInputChange}
              error={errors.isActive}
            />

            <FormField
              label="Featured"
              name="isFeatured"
              type="checkbox"
              value={formData.isFeatured}
              onChange={handleInputChange}
              error={errors.isFeatured}
            />
          </div>
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
        {showSubmitButton && (
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm;

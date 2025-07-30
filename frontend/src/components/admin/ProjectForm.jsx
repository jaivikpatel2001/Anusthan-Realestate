import { useState, useEffect } from 'react';
import { FormField } from './index';
import { useToast } from '../../hooks/useToast';

const ProjectForm = ({ 
  project = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { showError } = useToast();
  
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
        features: project.features || [],
        amenities: project.amenities?.map(a => typeof a === 'object' ? a.name : a) || [],
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

    onSubmit(submitData);
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
    <form onSubmit={handleSubmit} className="project-form">
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

          <FormField
            label="Hero Image URL"
            name="heroImage"
            value={formData.heroImage}
            onChange={handleInputChange}
            error={errors.heroImage}
            required
            placeholder="https://example.com/image.jpg"
          />
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

          <div className="array-input">
            <div className="array-input-row">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add an amenity"
                className="form-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('amenities', newAmenity, setNewAmenity);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addArrayItem('amenities', newAmenity, setNewAmenity)}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>

            <div className="array-items">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="array-item">
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('amenities', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;

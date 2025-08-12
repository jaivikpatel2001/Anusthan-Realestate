import { useState, useEffect } from 'react';
import { FormField } from './index';
import { useToast } from '../../hooks/useToast';
import { useGetProjectsQuery } from '../../store/api/projectsApi';

const ApartmentForm = ({ 
  apartment = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { showError } = useToast();
  
  // Get projects for dropdown
  const { data: projectsData } = useGetProjectsQuery({ limit: 100 });
  const projects = projectsData?.projects || [];
  
  const [formData, setFormData] = useState({
    projectId: '',
    type: '1BHK',
    bedrooms: 1,
    bathrooms: 1,
    area: {
      carpet: '',
      builtUp: '',
      superBuiltUp: ''
    },
    price: {
      base: '',
      perSqFt: '',
      maintenance: 0,
      parkingCharges: 0
    },
    floorPlan: {
      url: '',
      filename: ''
    },
    images: [],
    features: [],
    amenities: [],
    facing: '',
    floor: {
      min: '',
      max: ''
    },
    availability: {
      isAvailable: true,
      totalUnits: 1,
      availableUnits: '',
      soldUnits: 0
    },
    specifications: {
      flooring: '',
      kitchen: '',
      bathroom: '',
      doors: '',
      windows: '',
      electrical: '',
      plumbing: ''
    },
    possession: {
      readyToMove: false,
      expectedDate: '',
      actualDate: ''
    },
    isActive: true,
    isFeatured: false,
    sortOrder: 0
  });

  const [errors, setErrors] = useState({});
  const [newFeature, setNewFeature] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  // Populate form with existing apartment data
  useEffect(() => {
    if (apartment) {
      setFormData({
        projectId: apartment.projectId?._id || apartment.projectId || '',
        type: apartment.type || '1BHK',
        bedrooms: apartment.bedrooms || 1,
        bathrooms: apartment.bathrooms || 1,
        area: {
          carpet: apartment.area?.carpet || '',
          builtUp: apartment.area?.builtUp || '',
          superBuiltUp: apartment.area?.superBuiltUp || ''
        },
        price: {
          base: apartment.price?.base || '',
          perSqFt: apartment.price?.perSqFt || '',
          maintenance: apartment.price?.maintenance || 0,
          parkingCharges: apartment.price?.parkingCharges || 0
        },
        floorPlan: {
          url: apartment.floorPlan?.url || '',
          filename: apartment.floorPlan?.filename || ''
        },
        images: apartment.images || [],
        features: apartment.features || [],
        amenities: apartment.amenities || [],
        facing: apartment.facing || '',
        floor: {
          min: apartment.floor?.min || '',
          max: apartment.floor?.max || ''
        },
        availability: {
          isAvailable: apartment.availability?.isAvailable !== undefined ? apartment.availability.isAvailable : true,
          totalUnits: apartment.availability?.totalUnits || 1,
          availableUnits: apartment.availability?.availableUnits || '',
          soldUnits: apartment.availability?.soldUnits || 0
        },
        specifications: {
          flooring: apartment.specifications?.flooring || '',
          kitchen: apartment.specifications?.kitchen || '',
          bathroom: apartment.specifications?.bathroom || '',
          doors: apartment.specifications?.doors || '',
          windows: apartment.specifications?.windows || '',
          electrical: apartment.specifications?.electrical || '',
          plumbing: apartment.specifications?.plumbing || ''
        },
        possession: {
          readyToMove: apartment.possession?.readyToMove || false,
          expectedDate: apartment.possession?.expectedDate ? new Date(apartment.possession.expectedDate).toISOString().split('T')[0] : '',
          actualDate: apartment.possession?.actualDate ? new Date(apartment.possession.actualDate).toISOString().split('T')[0] : ''
        },
        isActive: apartment.isActive !== undefined ? apartment.isActive : true,
        isFeatured: apartment.isFeatured || false,
        sortOrder: apartment.sortOrder || 0
      });
    }
  }, [apartment]);

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
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.type) newErrors.type = 'Apartment type is required';
    if (!formData.bedrooms || formData.bedrooms < 0) newErrors.bedrooms = 'Valid number of bedrooms is required';
    if (!formData.bathrooms || formData.bathrooms < 0) newErrors.bathrooms = 'Valid number of bathrooms is required';
    if (!formData.price.base || formData.price.base <= 0) newErrors['price.base'] = 'Base price is required and must be positive';

    // Area validations
    if (formData.area.carpet && formData.area.carpet <= 0) {
      newErrors['area.carpet'] = 'Carpet area must be positive';
    }
    if (formData.area.builtUp && formData.area.builtUp <= 0) {
      newErrors['area.builtUp'] = 'Built-up area must be positive';
    }
    if (formData.area.superBuiltUp && formData.area.superBuiltUp <= 0) {
      newErrors['area.superBuiltUp'] = 'Super built-up area must be positive';
    }

    // Price validations
    if (formData.price.perSqFt && formData.price.perSqFt < 0) {
      newErrors['price.perSqFt'] = 'Price per sq ft cannot be negative';
    }
    if (formData.price.maintenance < 0) {
      newErrors['price.maintenance'] = 'Maintenance cost cannot be negative';
    }
    if (formData.price.parkingCharges < 0) {
      newErrors['price.parkingCharges'] = 'Parking charges cannot be negative';
    }

    // Floor validations
    if (formData.floor.min && formData.floor.min < 0) {
      newErrors['floor.min'] = 'Minimum floor cannot be negative';
    }
    if (formData.floor.max && formData.floor.max < 0) {
      newErrors['floor.max'] = 'Maximum floor cannot be negative';
    }

    // Floor range validation - both min and max required if one is provided
    if (formData.floor.min && !formData.floor.max) {
      newErrors['floor.max'] = 'Maximum floor is required when minimum floor is provided';
    }
    if (formData.floor.max && !formData.floor.min) {
      newErrors['floor.min'] = 'Minimum floor is required when maximum floor is provided';
    }
    if (formData.floor.min && formData.floor.max && Number(formData.floor.min) > Number(formData.floor.max)) {
      newErrors['floor.max'] = 'Maximum floor must be greater than or equal to minimum floor';
    }

    // Availability validations
    if (!formData.availability.totalUnits || formData.availability.totalUnits < 1) {
      newErrors['availability.totalUnits'] = 'Total units must be at least 1';
    }
    if (formData.availability.availableUnits && formData.availability.availableUnits < 0) {
      newErrors['availability.availableUnits'] = 'Available units cannot be negative';
    }
    if (formData.availability.soldUnits < 0) {
      newErrors['availability.soldUnits'] = 'Sold units cannot be negative';
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
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: {
        carpet: formData.area.carpet ? Number(formData.area.carpet) : undefined,
        builtUp: formData.area.builtUp ? Number(formData.area.builtUp) : undefined,
        superBuiltUp: formData.area.superBuiltUp ? Number(formData.area.superBuiltUp) : undefined
      },
      price: {
        base: Number(formData.price.base),
        perSqFt: formData.price.perSqFt ? Number(formData.price.perSqFt) : undefined,
        maintenance: Number(formData.price.maintenance),
        parkingCharges: Number(formData.price.parkingCharges)
      },
      floor: {
        min: formData.floor.min ? Number(formData.floor.min) : undefined,
        max: formData.floor.max ? Number(formData.floor.max) : undefined
      },
      availability: {
        ...formData.availability,
        totalUnits: Number(formData.availability.totalUnits),
        availableUnits: formData.availability.availableUnits ? Number(formData.availability.availableUnits) : formData.availability.totalUnits,
        soldUnits: Number(formData.availability.soldUnits)
      },
      sortOrder: Number(formData.sortOrder)
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

  const apartmentTypes = [
    { value: '1RK', label: '1 RK' },
    { value: '1BHK', label: '1 BHK' },
    { value: '2BHK', label: '2 BHK' },
    { value: '3BHK', label: '3 BHK' },
    { value: '4BHK', label: '4 BHK' },
    { value: '5BHK', label: '5 BHK' },
    { value: 'Penthouse', label: 'Penthouse' },
    { value: 'Studio', label: 'Studio' },
    { value: 'Duplex', label: 'Duplex' },
    { value: 'Villa', label: 'Villa' }
  ];

  const facingOptions = [
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' },
    { value: 'north-east', label: 'North-East' },
    { value: 'north-west', label: 'North-West' },
    { value: 'south-east', label: 'South-East' },
    { value: 'south-west', label: 'South-West' }
  ];

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: `${project.title} - ${project.location}`
  }));

  return (
    <form onSubmit={handleSubmit} className="apartment-form">
      <div className="form-grid">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <FormField
            label="Project"
            name="projectId"
            type="select"
            value={formData.projectId}
            onChange={handleInputChange}
            error={errors.projectId}
            options={projectOptions}
            required
          />

          <div className="form-row">
            <FormField
              label="Apartment Type"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              error={errors.type}
              options={apartmentTypes}
              required
            />

            <FormField
              label="Facing"
              name="facing"
              type="select"
              value={formData.facing}
              onChange={handleInputChange}
              error={errors.facing}
              options={facingOptions}
            />
          </div>

          <div className="form-row">
            <FormField
              label="Bedrooms"
              name="bedrooms"
              type="number"
              min="0"
              value={formData.bedrooms}
              onChange={handleInputChange}
              error={errors.bedrooms}
              required
            />

            <FormField
              label="Bathrooms"
              name="bathrooms"
              type="number"
              min="0"
              value={formData.bathrooms}
              onChange={handleInputChange}
              error={errors.bathrooms}
              required
            />
          </div>
        </div>

        {/* Area Information */}
        <div className="form-section">
          <h3>Area Details</h3>

          <div className="form-row">
            <FormField
              label="Carpet Area (sq ft)"
              name="area.carpet"
              type="number"
              min="0"
              value={formData.area.carpet}
              onChange={handleInputChange}
              error={errors['area.carpet']}
              placeholder="Carpet area"
            />

            <FormField
              label="Built-up Area (sq ft)"
              name="area.builtUp"
              type="number"
              min="0"
              value={formData.area.builtUp}
              onChange={handleInputChange}
              error={errors['area.builtUp']}
              placeholder="Built-up area"
            />
          </div>

          <FormField
            label="Super Built-up Area (sq ft)"
            name="area.superBuiltUp"
            type="number"
            min="0"
            value={formData.area.superBuiltUp}
            onChange={handleInputChange}
            error={errors['area.superBuiltUp']}
            placeholder="Super built-up area"
          />
        </div>

        {/* Pricing Information */}
        <div className="form-section">
          <h3>Pricing Details</h3>

          <div className="form-row">
            <FormField
              label="Base Price"
              name="price.base"
              type="number"
              min="0"
              value={formData.price.base}
              onChange={handleInputChange}
              error={errors['price.base']}
              required
              placeholder="Base price"
            />

            <FormField
              label="Price per Sq Ft"
              name="price.perSqFt"
              type="number"
              min="0"
              value={formData.price.perSqFt}
              onChange={handleInputChange}
              error={errors['price.perSqFt']}
              placeholder="Price per sq ft"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Maintenance Cost"
              name="price.maintenance"
              type="number"
              min="0"
              value={formData.price.maintenance}
              onChange={handleInputChange}
              error={errors['price.maintenance']}
              placeholder="Monthly maintenance"
            />

            <FormField
              label="Parking Charges"
              name="price.parkingCharges"
              type="number"
              min="0"
              value={formData.price.parkingCharges}
              onChange={handleInputChange}
              error={errors['price.parkingCharges']}
              placeholder="Parking charges"
            />
          </div>
        </div>

        {/* Floor Information */}
        <div className="form-section">
          <h3>Floor Details</h3>

          <div className="form-row">
            <FormField
              label="Minimum Floor"
              name="floor.min"
              type="number"
              min="0"
              value={formData.floor.min}
              onChange={handleInputChange}
              error={errors['floor.min']}
              placeholder="Minimum floor"
            />

            <FormField
              label="Maximum Floor"
              name="floor.max"
              type="number"
              min="0"
              value={formData.floor.max}
              onChange={handleInputChange}
              error={errors['floor.max']}
              placeholder="Maximum floor"
            />
          </div>
        </div>

        {/* Availability */}
        <div className="form-section">
          <h3>Availability</h3>

          <div className="form-row">
            <FormField
              label="Total Units"
              name="availability.totalUnits"
              type="number"
              min="1"
              value={formData.availability.totalUnits}
              onChange={handleInputChange}
              error={errors['availability.totalUnits']}
              required
              placeholder="Total units"
            />

            <FormField
              label="Available Units"
              name="availability.availableUnits"
              type="number"
              min="0"
              value={formData.availability.availableUnits}
              onChange={handleInputChange}
              error={errors['availability.availableUnits']}
              placeholder="Available units"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Sold Units"
              name="availability.soldUnits"
              type="number"
              min="0"
              value={formData.availability.soldUnits}
              onChange={handleInputChange}
              error={errors['availability.soldUnits']}
              placeholder="Sold units"
            />

            <FormField
              label="Available"
              name="availability.isAvailable"
              type="checkbox"
              value={formData.availability.isAvailable}
              onChange={handleInputChange}
              error={errors['availability.isAvailable']}
            />
          </div>
        </div>

        {/* Floor Plan */}
        <div className="form-section">
          <h3>Floor Plan</h3>

          <FormField
            label="Floor Plan URL"
            name="floorPlan.url"
            value={formData.floorPlan.url}
            onChange={handleInputChange}
            error={errors['floorPlan.url']}
            placeholder="https://example.com/floorplan.jpg"
          />

          <FormField
            label="Floor Plan Filename"
            name="floorPlan.filename"
            value={formData.floorPlan.filename}
            onChange={handleInputChange}
            error={errors['floorPlan.filename']}
            placeholder="Floor plan filename"
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
              label="Flooring"
              name="specifications.flooring"
              value={formData.specifications.flooring}
              onChange={handleInputChange}
              error={errors['specifications.flooring']}
              placeholder="Flooring type"
            />

            <FormField
              label="Kitchen"
              name="specifications.kitchen"
              value={formData.specifications.kitchen}
              onChange={handleInputChange}
              error={errors['specifications.kitchen']}
              placeholder="Kitchen specifications"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Bathroom"
              name="specifications.bathroom"
              value={formData.specifications.bathroom}
              onChange={handleInputChange}
              error={errors['specifications.bathroom']}
              placeholder="Bathroom specifications"
            />

            <FormField
              label="Doors"
              name="specifications.doors"
              value={formData.specifications.doors}
              onChange={handleInputChange}
              error={errors['specifications.doors']}
              placeholder="Door specifications"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Windows"
              name="specifications.windows"
              value={formData.specifications.windows}
              onChange={handleInputChange}
              error={errors['specifications.windows']}
              placeholder="Window specifications"
            />

            <FormField
              label="Electrical"
              name="specifications.electrical"
              value={formData.specifications.electrical}
              onChange={handleInputChange}
              error={errors['specifications.electrical']}
              placeholder="Electrical specifications"
            />
          </div>

          <FormField
            label="Plumbing"
            name="specifications.plumbing"
            value={formData.specifications.plumbing}
            onChange={handleInputChange}
            error={errors['specifications.plumbing']}
            placeholder="Plumbing specifications"
          />
        </div>

        {/* Possession */}
        <div className="form-section">
          <h3>Possession Details</h3>

          <FormField
            label="Ready to Move"
            name="possession.readyToMove"
            type="checkbox"
            value={formData.possession.readyToMove}
            onChange={handleInputChange}
            error={errors['possession.readyToMove']}
          />

          <div className="form-row">
            <FormField
              label="Expected Possession Date"
              name="possession.expectedDate"
              type="date"
              value={formData.possession.expectedDate}
              onChange={handleInputChange}
              error={errors['possession.expectedDate']}
            />

            <FormField
              label="Actual Possession Date"
              name="possession.actualDate"
              type="date"
              value={formData.possession.actualDate}
              onChange={handleInputChange}
              error={errors['possession.actualDate']}
            />
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

          <FormField
            label="Sort Order"
            name="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={handleInputChange}
            error={errors.sortOrder}
            placeholder="Sort order (0 = first)"
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
          {isLoading ? 'Saving...' : (apartment ? 'Update Apartment' : 'Create Apartment')}
        </button>
      </div>
    </form>
  );
};

export default ApartmentForm;

import { useState, useEffect } from 'react';
import { FormField } from './index';
import { useToast } from '../../hooks/useToast';
import { useGetProjectsQuery } from '../../store/api/projectsApi';
import { useGetApartmentsByProjectQuery } from '../../store/api/apartmentsApi';

const LeadForm = ({ 
  lead = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { showError } = useToast();
  
  // Get projects for dropdown
  const { data: projectsData } = useGetProjectsQuery({ limit: 100 });
  const projects = projectsData?.projects || [];
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    projectId: '',
    apartmentId: '',
    source: 'website',
    leadType: 'inquiry',
    status: 'new',
    priority: 'medium',
    budget: {
      min: '',
      max: ''
    },
    requirements: {
      bedrooms: '',
      bathrooms: '',
      preferredFloor: '',
      facing: '',
      moveInDate: '',
      additionalRequirements: ''
    },
    notes: '',
    assignedTo: '',
    followUpDate: '',
    isActive: true,
    isQualified: false
  });

  const [errors, setErrors] = useState({});

  // Get apartments for selected project
  const { data: apartmentsData } = useGetApartmentsByProjectQuery(
    { projectId: formData.projectId },
    { skip: !formData.projectId }
  );
  const apartments = apartmentsData || [];

  // Populate form with existing lead data
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        mobile: lead.mobile || '',
        email: lead.email || '',
        projectId: lead.projectId?._id || lead.projectId || '',
        apartmentId: lead.apartmentId?._id || lead.apartmentId || '',
        source: lead.source || 'website',
        leadType: lead.leadType || 'inquiry',
        status: lead.status || 'new',
        priority: lead.priority || 'medium',
        budget: {
          min: lead.budget?.min || '',
          max: lead.budget?.max || ''
        },
        requirements: {
          bedrooms: lead.requirements?.bedrooms || '',
          bathrooms: lead.requirements?.bathrooms || '',
          preferredFloor: lead.requirements?.preferredFloor || '',
          facing: lead.requirements?.facing || '',
          moveInDate: lead.requirements?.moveInDate ? new Date(lead.requirements.moveInDate).toISOString().split('T')[0] : '',
          additionalRequirements: lead.requirements?.additionalRequirements || ''
        },
        notes: lead.notes || '',
        assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
        followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '',
        isActive: lead.isActive !== undefined ? lead.isActive : true,
        isQualified: lead.isQualified || false
      });
    }
  }, [lead]);

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

    // Clear apartment selection when project changes
    if (name === 'projectId') {
      setFormData(prev => ({
        ...prev,
        apartmentId: ''
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
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';

    // Mobile number validation (Indian format)
    if (formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please provide a valid 10-digit Indian mobile number';
    }

    // Email validation
    if (formData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    // Budget validation
    if (formData.budget.min && formData.budget.min < 0) {
      newErrors['budget.min'] = 'Minimum budget cannot be negative';
    }
    if (formData.budget.max && formData.budget.max < 0) {
      newErrors['budget.max'] = 'Maximum budget cannot be negative';
    }

    // Budget range validation - both min and max required if one is provided
    if (formData.budget.min && !formData.budget.max) {
      newErrors['budget.max'] = 'Maximum budget is required when minimum budget is provided';
    }
    if (formData.budget.max && !formData.budget.min) {
      newErrors['budget.min'] = 'Minimum budget is required when maximum budget is provided';
    }
    if (formData.budget.min && formData.budget.max && Number(formData.budget.min) > Number(formData.budget.max)) {
      newErrors['budget.max'] = 'Maximum budget must be greater than minimum budget';
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
      budget: {
        min: formData.budget.min ? Number(formData.budget.min) : undefined,
        max: formData.budget.max ? Number(formData.budget.max) : undefined
      },
      requirements: {
        ...formData.requirements,
        bedrooms: formData.requirements.bedrooms ? Number(formData.requirements.bedrooms) : undefined,
        bathrooms: formData.requirements.bathrooms ? Number(formData.requirements.bathrooms) : undefined
      }
    };

    onSubmit(submitData);
  };

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'other', label: 'Other' }
  ];

  const leadTypeOptions = [
    { value: 'inquiry', label: 'Inquiry' },
    { value: 'site_visit', label: 'Site Visit' },
    { value: 'brochure_download', label: 'Brochure Download' },
    { value: 'callback_request', label: 'Callback Request' },
    { value: 'booking_interest', label: 'Booking Interest' }
  ];

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'booking', label: 'Booking' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'not_interested', label: 'Not Interested' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
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

  const apartmentOptions = apartments.map(apartment => ({
    value: apartment._id,
    label: `${apartment.type} - ${apartment.bedrooms}BR/${apartment.bathrooms}BA`
  }));

  return (
    <form onSubmit={handleSubmit} className="lead-form">
      <div className="form-grid">
        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Lead name"
          />

          <div className="form-row">
            <FormField
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              error={errors.mobile}
              required
              placeholder="10-digit mobile number"
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Email address"
            />
          </div>
        </div>

        {/* Lead Details */}
        <div className="form-section">
          <h3>Lead Details</h3>
          
          <div className="form-row">
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

            <FormField
              label="Apartment"
              name="apartmentId"
              type="select"
              value={formData.apartmentId}
              onChange={handleInputChange}
              error={errors.apartmentId}
              options={apartmentOptions}
              disabled={!formData.projectId}
            />
          </div>

          <div className="form-row">
            <FormField
              label="Source"
              name="source"
              type="select"
              value={formData.source}
              onChange={handleInputChange}
              error={errors.source}
              options={sourceOptions}
            />

            <FormField
              label="Lead Type"
              name="leadType"
              type="select"
              value={formData.leadType}
              onChange={handleInputChange}
              error={errors.leadType}
              options={leadTypeOptions}
            />
          </div>

          <div className="form-row">
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleInputChange}
              error={errors.status}
              options={statusOptions}
            />

            <FormField
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleInputChange}
              error={errors.priority}
              options={priorityOptions}
            />
          </div>

          <FormField
            label="Follow-up Date"
            name="followUpDate"
            type="date"
            value={formData.followUpDate}
            onChange={handleInputChange}
            error={errors.followUpDate}
          />
        </div>

        {/* Budget Information */}
        <div className="form-section">
          <h3>Budget Range</h3>

          <div className="form-row">
            <FormField
              label="Minimum Budget"
              name="budget.min"
              type="number"
              min="0"
              value={formData.budget.min}
              onChange={handleInputChange}
              error={errors['budget.min']}
              placeholder="Minimum budget"
            />

            <FormField
              label="Maximum Budget"
              name="budget.max"
              type="number"
              min="0"
              value={formData.budget.max}
              onChange={handleInputChange}
              error={errors['budget.max']}
              placeholder="Maximum budget"
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="form-section">
          <h3>Requirements</h3>

          <div className="form-row">
            <FormField
              label="Bedrooms"
              name="requirements.bedrooms"
              type="number"
              min="0"
              value={formData.requirements.bedrooms}
              onChange={handleInputChange}
              error={errors['requirements.bedrooms']}
              placeholder="Number of bedrooms"
            />

            <FormField
              label="Bathrooms"
              name="requirements.bathrooms"
              type="number"
              min="0"
              value={formData.requirements.bathrooms}
              onChange={handleInputChange}
              error={errors['requirements.bathrooms']}
              placeholder="Number of bathrooms"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Preferred Floor"
              name="requirements.preferredFloor"
              value={formData.requirements.preferredFloor}
              onChange={handleInputChange}
              error={errors['requirements.preferredFloor']}
              placeholder="e.g., Ground, 1st, 2nd, High floor"
            />

            <FormField
              label="Facing"
              name="requirements.facing"
              type="select"
              value={formData.requirements.facing}
              onChange={handleInputChange}
              error={errors['requirements.facing']}
              options={facingOptions}
            />
          </div>

          <FormField
            label="Move-in Date"
            name="requirements.moveInDate"
            type="date"
            value={formData.requirements.moveInDate}
            onChange={handleInputChange}
            error={errors['requirements.moveInDate']}
          />

          <FormField
            label="Additional Requirements"
            name="requirements.additionalRequirements"
            type="textarea"
            rows={3}
            value={formData.requirements.additionalRequirements}
            onChange={handleInputChange}
            error={errors['requirements.additionalRequirements']}
            placeholder="Any specific requirements or preferences"
          />
        </div>

        {/* Notes and Settings */}
        <div className="form-section">
          <h3>Notes & Settings</h3>

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            error={errors.notes}
            placeholder="Internal notes about the lead"
          />

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
              label="Qualified"
              name="isQualified"
              type="checkbox"
              value={formData.isQualified}
              onChange={handleInputChange}
              error={errors.isQualified}
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
          {isLoading ? 'Saving...' : (lead ? 'Update Lead' : 'Create Lead')}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;

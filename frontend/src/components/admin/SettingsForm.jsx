import { useState, useEffect } from 'react';
import { FormField } from './index';
import { useToast } from '../../hooks/useToast';

const SettingsForm = ({ 
  settings = null, 
  section = 'company', // company, contact, social, seo, business, integrations, theme
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { showError } = useToast();
  
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [newKeyword, setNewKeyword] = useState('');

  // Initialize form data based on section
  useEffect(() => {
    if (settings) {
      switch (section) {
        case 'company':
          setFormData({
            name: settings.company?.name || '',
            tagline: settings.company?.tagline || '',
            description: settings.company?.description || '',
            logo: settings.company?.logo?.url || '',
            favicon: settings.company?.favicon?.url || ''
          });
          break;
        case 'contact':
          setFormData({
            phone: {
              primary: settings.contact?.phone?.primary || '',
              secondary: settings.contact?.phone?.secondary || '',
              whatsapp: settings.contact?.phone?.whatsapp || ''
            },
            email: {
              primary: settings.contact?.email?.primary || '',
              support: settings.contact?.email?.support || '',
              sales: settings.contact?.email?.sales || ''
            },
            address: {
              street: settings.contact?.address?.street || '',
              city: settings.contact?.address?.city || '',
              state: settings.contact?.address?.state || '',
              zipCode: settings.contact?.address?.zipCode || '',
              country: settings.contact?.address?.country || 'India'
            },
            coordinates: {
              latitude: settings.contact?.coordinates?.latitude || '',
              longitude: settings.contact?.coordinates?.longitude || ''
            }
          });
          break;
        case 'social':
          setFormData({
            facebook: settings.socialMedia?.facebook || '',
            twitter: settings.socialMedia?.twitter || '',
            instagram: settings.socialMedia?.instagram || '',
            linkedin: settings.socialMedia?.linkedin || '',
            youtube: settings.socialMedia?.youtube || '',
            pinterest: settings.socialMedia?.pinterest || ''
          });
          break;
        case 'seo':
          setFormData({
            metaTitle: settings.seo?.metaTitle || '',
            metaDescription: settings.seo?.metaDescription || '',
            keywords: settings.seo?.keywords || [],
            ogImage: settings.seo?.ogImage?.url || '',
            googleAnalyticsId: settings.seo?.googleAnalyticsId || '',
            googleTagManagerId: settings.seo?.googleTagManagerId || '',
            facebookPixelId: settings.seo?.facebookPixelId || ''
          });
          break;
        case 'business':
          setFormData({
            monday: settings.businessHours?.monday || { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            tuesday: settings.businessHours?.tuesday || { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            wednesday: settings.businessHours?.wednesday || { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            thursday: settings.businessHours?.thursday || { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            friday: settings.businessHours?.friday || { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            saturday: settings.businessHours?.saturday || { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            sunday: settings.businessHours?.sunday || { isOpen: false, openTime: '09:00', closeTime: '18:00' }
          });
          break;
        case 'integrations':
          setFormData({
            googleMaps: {
              apiKey: settings.integrations?.googleMaps?.apiKey || '',
              isEnabled: settings.integrations?.googleMaps?.isEnabled || false
            },
            whatsapp: {
              businessNumber: settings.integrations?.whatsapp?.businessNumber || '',
              isEnabled: settings.integrations?.whatsapp?.isEnabled || false
            },
            razorpay: {
              keyId: settings.integrations?.razorpay?.keyId || '',
              isEnabled: settings.integrations?.razorpay?.isEnabled || false
            },
            mailchimp: {
              apiKey: settings.integrations?.mailchimp?.apiKey || '',
              listId: settings.integrations?.mailchimp?.listId || '',
              isEnabled: settings.integrations?.mailchimp?.isEnabled || false
            }
          });
          break;
        case 'theme':
          setFormData({
            primaryColor: settings.theme?.primaryColor || '#007bff',
            secondaryColor: settings.theme?.secondaryColor || '#6c757d',
            accentColor: settings.theme?.accentColor || '#28a745',
            fontFamily: settings.theme?.fontFamily || 'Inter, sans-serif'
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [settings, section]);

  const handleInputChange = (name, value) => {
    // Handle nested object updates
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
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

    switch (section) {
      case 'company':
        if (!formData.name?.trim()) newErrors.name = 'Company name is required';
        break;
      case 'contact':
        if (!formData.phone?.primary?.trim()) newErrors['phone.primary'] = 'Primary phone is required';
        if (!formData.email?.primary?.trim()) newErrors['email.primary'] = 'Primary email is required';
        if (formData.email?.primary && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email.primary)) {
          newErrors['email.primary'] = 'Please provide a valid primary email';
        }
        break;
      case 'seo':
        if (formData.metaTitle && formData.metaTitle.length > 60) {
          newErrors.metaTitle = 'Meta title cannot exceed 60 characters';
        }
        if (formData.metaDescription && formData.metaDescription.length > 160) {
          newErrors.metaDescription = 'Meta description cannot exceed 160 characters';
        }
        break;
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

    onSubmit(formData);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter((_, i) => i !== index) || []
    }));
  };

  const renderCompanyForm = () => (
    <>
      <FormField
        label="Company Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        error={errors.name}
        required
        placeholder="Enter company name"
      />

      <FormField
        label="Tagline"
        name="tagline"
        value={formData.tagline}
        onChange={handleInputChange}
        error={errors.tagline}
        placeholder="Enter company tagline"
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        rows={4}
        value={formData.description}
        onChange={handleInputChange}
        error={errors.description}
        placeholder="Enter company description"
      />

      <FormField
        label="Logo URL"
        name="logo"
        value={formData.logo}
        onChange={handleInputChange}
        error={errors.logo}
        placeholder="https://example.com/logo.png"
      />

      <FormField
        label="Favicon URL"
        name="favicon"
        value={formData.favicon}
        onChange={handleInputChange}
        error={errors.favicon}
        placeholder="https://example.com/favicon.ico"
      />
    </>
  );

  const renderContactForm = () => (
    <>
      <div className="form-section">
        <h4>Phone Numbers</h4>
        <FormField
          label="Primary Phone"
          name="phone.primary"
          value={formData.phone?.primary}
          onChange={handleInputChange}
          error={errors['phone.primary']}
          required
          placeholder="+91-9999999999"
        />

        <FormField
          label="Secondary Phone"
          name="phone.secondary"
          value={formData.phone?.secondary}
          onChange={handleInputChange}
          error={errors['phone.secondary']}
          placeholder="+91-8888888888"
        />

        <FormField
          label="WhatsApp Number"
          name="phone.whatsapp"
          value={formData.phone?.whatsapp}
          onChange={handleInputChange}
          error={errors['phone.whatsapp']}
          placeholder="+91-7777777777"
        />
      </div>

      <div className="form-section">
        <h4>Email Addresses</h4>
        <FormField
          label="Primary Email"
          name="email.primary"
          type="email"
          value={formData.email?.primary}
          onChange={handleInputChange}
          error={errors['email.primary']}
          required
          placeholder="info@company.com"
        />

        <FormField
          label="Support Email"
          name="email.support"
          type="email"
          value={formData.email?.support}
          onChange={handleInputChange}
          error={errors['email.support']}
          placeholder="support@company.com"
        />

        <FormField
          label="Sales Email"
          name="email.sales"
          type="email"
          value={formData.email?.sales}
          onChange={handleInputChange}
          error={errors['email.sales']}
          placeholder="sales@company.com"
        />
      </div>
      <div className="form-section">
        <h4>Address</h4>
        <FormField
          label="Street Address"
          name="address.street"
          value={formData.address?.street}
          onChange={handleInputChange}
          error={errors['address.street']}
          placeholder="123 Main Street"
        />
        <div className="form-row">
          <div className="form-col">
            <FormField
              label="City"
              name="address.city"
              value={formData.address?.city}
              onChange={handleInputChange}
              error={errors['address.city']}
              placeholder="City"
            />
          </div>
          <div className="form-col">
            <FormField
              label="State/Province"
              name="address.state"
              value={formData.address?.state}
              onChange={handleInputChange}
              error={errors['address.state']}
              placeholder="State"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col">
            <FormField
              label="Postal/Zip Code"
              name="address.zipCode"
              value={formData.address?.zipCode}
              onChange={handleInputChange}
              error={errors['address.zipCode']}
              placeholder="123456"
            />
          </div>
          <div className="form-col">
            <FormField
              label="Country"
              name="address.country"
              value={formData.address?.country}
              onChange={handleInputChange}
              error={errors['address.country']}
              placeholder="Country"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderSocialForm = () => (
    <>
      <FormField
        label="Facebook"
        name="facebook"
        value={formData.facebook}
        onChange={handleInputChange}
        error={errors.facebook}
        placeholder="https://facebook.com/yourpage"
      />

      <FormField
        label="Twitter"
        name="twitter"
        value={formData.twitter}
        onChange={handleInputChange}
        error={errors.twitter}
        placeholder="https://twitter.com/yourhandle"
      />

      <FormField
        label="Instagram"
        name="instagram"
        value={formData.instagram}
        onChange={handleInputChange}
        error={errors.instagram}
        placeholder="https://instagram.com/yourhandle"
      />

      <FormField
        label="LinkedIn"
        name="linkedin"
        value={formData.linkedin}
        onChange={handleInputChange}
        error={errors.linkedin}
        placeholder="https://linkedin.com/company/yourcompany"
      />

      <FormField
        label="YouTube"
        name="youtube"
        value={formData.youtube}
        onChange={handleInputChange}
        error={errors.youtube}
        placeholder="https://youtube.com/channel/yourchannel"
      />

      <FormField
        label="Pinterest"
        name="pinterest"
        value={formData.pinterest}
        onChange={handleInputChange}
        error={errors.pinterest}
        placeholder="https://pinterest.com/yourprofile"
      />
    </>
  );

  const renderSeoForm = () => (
    <>
      <FormField
        label="Meta Title"
        name="metaTitle"
        value={formData.metaTitle}
        onChange={handleInputChange}
        error={errors.metaTitle}
        placeholder="SEO meta title (max 60 characters)"
        helpText="Appears in search engine results"
      />

      <FormField
        label="Meta Description"
        name="metaDescription"
        type="textarea"
        rows={3}
        value={formData.metaDescription}
        onChange={handleInputChange}
        error={errors.metaDescription}
        placeholder="SEO meta description (max 160 characters)"
        helpText="Brief description for search engines"
      />

      <div className="array-input">
        <label>SEO Keywords</label>
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
                addKeyword();
              }
            }}
          />
          <button
            type="button"
            onClick={addKeyword}
            className="btn btn-secondary"
          >
            Add
          </button>
        </div>

        <div className="array-items">
          {formData.keywords?.map((keyword, index) => (
            <div key={index} className="array-item">
              <span>{keyword}</span>
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <FormField
        label="Open Graph Image"
        name="ogImage"
        value={formData.ogImage}
        onChange={handleInputChange}
        error={errors.ogImage}
        placeholder="https://example.com/og-image.jpg"
        helpText="Image for social media sharing"
      />

      <FormField
        label="Google Analytics ID"
        name="googleAnalyticsId"
        value={formData.googleAnalyticsId}
        onChange={handleInputChange}
        error={errors.googleAnalyticsId}
        placeholder="GA-XXXXXXXXX-X"
      />

      <FormField
        label="Google Tag Manager ID"
        name="googleTagManagerId"
        value={formData.googleTagManagerId}
        onChange={handleInputChange}
        error={errors.googleTagManagerId}
        placeholder="GTM-XXXXXXX"
      />

      <FormField
        label="Facebook Pixel ID"
        name="facebookPixelId"
        value={formData.facebookPixelId}
        onChange={handleInputChange}
        error={errors.facebookPixelId}
        placeholder="123456789012345"
      />
    </>
  );

  const renderBusinessHoursForm = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <>
        {days.map((day, index) => (
          <div key={day} className="business-hours-day">
            <h4>{dayLabels[index]}</h4>
            <div className="form-row">
              <FormField
                label="Open"
                name={`${day}.isOpen`}
                type="checkbox"
                value={formData[day]?.isOpen}
                onChange={handleInputChange}
                error={errors[`${day}.isOpen`]}
              />

              <FormField
                label="Open Time"
                name={`${day}.openTime`}
                type="time"
                value={formData[day]?.openTime}
                onChange={handleInputChange}
                error={errors[`${day}.openTime`]}
                disabled={!formData[day]?.isOpen}
              />

              <FormField
                label="Close Time"
                name={`${day}.closeTime`}
                type="time"
                value={formData[day]?.closeTime}
                onChange={handleInputChange}
                error={errors[`${day}.closeTime`]}
                disabled={!formData[day]?.isOpen}
              />
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderIntegrationsForm = () => (
    <>
      <div className="integration-section">
        <h4>Google Maps</h4>
        <FormField
          label="API Key"
          name="googleMaps.apiKey"
          value={formData.googleMaps?.apiKey}
          onChange={handleInputChange}
          error={errors['googleMaps.apiKey']}
          placeholder="Google Maps API Key"
        />
        <FormField
          label="Enabled"
          name="googleMaps.isEnabled"
          type="checkbox"
          value={formData.googleMaps?.isEnabled}
          onChange={handleInputChange}
          error={errors['googleMaps.isEnabled']}
        />
      </div>

      <div className="integration-section">
        <h4>WhatsApp Business</h4>
        <FormField
          label="Business Number"
          name="whatsapp.businessNumber"
          value={formData.whatsapp?.businessNumber}
          onChange={handleInputChange}
          error={errors['whatsapp.businessNumber']}
          placeholder="+91-9999999999"
        />
        <FormField
          label="Enabled"
          name="whatsapp.isEnabled"
          type="checkbox"
          value={formData.whatsapp?.isEnabled}
          onChange={handleInputChange}
          error={errors['whatsapp.isEnabled']}
        />
      </div>

      <div className="integration-section">
        <h4>Razorpay</h4>
        <FormField
          label="Key ID"
          name="razorpay.keyId"
          value={formData.razorpay?.keyId}
          onChange={handleInputChange}
          error={errors['razorpay.keyId']}
          placeholder="rzp_test_xxxxxxxxxx"
        />
        <FormField
          label="Enabled"
          name="razorpay.isEnabled"
          type="checkbox"
          value={formData.razorpay?.isEnabled}
          onChange={handleInputChange}
          error={errors['razorpay.isEnabled']}
        />
      </div>

      <div className="integration-section">
        <h4>Mailchimp</h4>
        <FormField
          label="API Key"
          name="mailchimp.apiKey"
          value={formData.mailchimp?.apiKey}
          onChange={handleInputChange}
          error={errors['mailchimp.apiKey']}
          placeholder="Mailchimp API Key"
        />
        <FormField
          label="List ID"
          name="mailchimp.listId"
          value={formData.mailchimp?.listId}
          onChange={handleInputChange}
          error={errors['mailchimp.listId']}
          placeholder="Mailchimp List ID"
        />
        <FormField
          label="Enabled"
          name="mailchimp.isEnabled"
          type="checkbox"
          value={formData.mailchimp?.isEnabled}
          onChange={handleInputChange}
          error={errors['mailchimp.isEnabled']}
        />
      </div>
      <div className="form-section">
        <h4>Address</h4>
        <FormField
          label="Street Address"
          name="address.street"
          value={formData.address?.street}
          onChange={handleInputChange}
          error={errors['address.street']}
          placeholder="123 Main Street"
        />
        <div className="form-row">
          <div className="form-col">
            <FormField
              label="City"
              name="address.city"
              value={formData.address?.city}
              onChange={handleInputChange}
              error={errors['address.city']}
              placeholder="City"
            />
          </div>
          <div className="form-col">
            <FormField
              label="State/Province"
              name="address.state"
              value={formData.address?.state}
              onChange={handleInputChange}
              error={errors['address.state']}
              placeholder="State"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-col">
            <FormField
              label="Postal/Zip Code"
              name="address.zipCode"
              value={formData.address?.zipCode}
              onChange={handleInputChange}
              error={errors['address.zipCode']}
              placeholder="123456"
            />
          </div>
          <div className="form-col">
            <FormField
              label="Country"
              name="address.country"
              value={formData.address?.country}
              onChange={handleInputChange}
              error={errors['address.country']}
              placeholder="Country"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderThemeForm = () => (
    <>
      <FormField
        label="Primary Color"
        name="primaryColor"
        type="color"
        value={formData.primaryColor}
        onChange={handleInputChange}
        error={errors.primaryColor}
        helpText="Main brand color"
      />

      <FormField
        label="Secondary Color"
        name="secondaryColor"
        type="color"
        value={formData.secondaryColor}
        onChange={handleInputChange}
        error={errors.secondaryColor}
        helpText="Secondary brand color"
      />

      <FormField
        label="Accent Color"
        name="accentColor"
        type="color"
        value={formData.accentColor}
        onChange={handleInputChange}
        error={errors.accentColor}
        helpText="Accent/highlight color"
      />

      <FormField
        label="Font Family"
        name="fontFamily"
        type="select"
        value={formData.fontFamily}
        onChange={handleInputChange}
        error={errors.fontFamily}
        options={[
          { value: 'Inter, sans-serif', label: 'Inter' },
          { value: 'Roboto, sans-serif', label: 'Roboto' },
          { value: 'Open Sans, sans-serif', label: 'Open Sans' },
          { value: 'Lato, sans-serif', label: 'Lato' },
          { value: 'Poppins, sans-serif', label: 'Poppins' },
          { value: 'Montserrat, sans-serif', label: 'Montserrat' }
        ]}
        helpText="Website font family"
      />
    </>
  );

  const getSectionTitle = () => {
    switch (section) {
      case 'company': return 'Company Information';
      case 'contact': return 'Contact Information';
      case 'social': return 'Social Media Links';
      case 'seo': return 'SEO Settings';
      case 'business': return 'Business Hours';
      case 'integrations': return 'Integrations';
      case 'theme': return 'Theme Settings';
      default: return 'Settings';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      <div className="form-section">
        <h3>{getSectionTitle()}</h3>
        
        {section === 'company' && renderCompanyForm()}
        {section === 'contact' && renderContactForm()}
        {section === 'social' && renderSocialForm()}
        {section === 'seo' && renderSeoForm()}
        {section === 'business' && renderBusinessHoursForm()}
        {section === 'integrations' && renderIntegrationsForm()}
        {section === 'theme' && renderThemeForm()}
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
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSettings, 
  FiEdit, 
  FiSave, 
  FiPhone, 
  FiShare2, 
  FiSearch, 
  FiClock, 
  FiZap, 
} from 'react-icons/fi';
import { 
  useGetAdminSettingsQuery,
  useUpdateCompanyInfoMutation,
  useUpdateContactInfoMutation,
  useUpdateSocialMediaMutation,
  useUpdateSeoSettingsMutation,
  useUpdateBusinessHoursMutation,
  useUpdateIntegrationsMutation,
  useUpdateThemeSettingsMutation
} from '../../store/api/settingsApi';
import { useToast } from '../../hooks/useToast';
import { FormModal } from './index';
import SettingsForm from './SettingsForm';
import LoadingSpinner from '../LoadingSpinner';
import { BsFillBuildingFill, BsFillPaletteFill } from 'react-icons/bs';

const SettingsManagement = () => {
  const { showSuccess, showError } = useToast();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSection, setCurrentSection] = useState('company');

  // API hooks
  const { 
    data: settings, 
    isLoading: settingsLoading, 
    refetch: refetchSettings 
  } = useGetAdminSettingsQuery();

  const [updateCompanyInfo, { isLoading: companyLoading }] = useUpdateCompanyInfoMutation();
  const [updateContactInfo, { isLoading: contactLoading }] = useUpdateContactInfoMutation();
  const [updateSocialMedia, { isLoading: socialLoading }] = useUpdateSocialMediaMutation();
  const [updateSeoSettings, { isLoading: seoLoading }] = useUpdateSeoSettingsMutation();
  const [updateBusinessHours, { isLoading: businessLoading }] = useUpdateBusinessHoursMutation();
  const [updateIntegrations, { isLoading: integrationsLoading }] = useUpdateIntegrationsMutation();
  const [updateThemeSettings, { isLoading: themeLoading }] = useUpdateThemeSettingsMutation();

  const isLoading = companyLoading || contactLoading || socialLoading || seoLoading || 
                   businessLoading || integrationsLoading || themeLoading;

  // Handle section updates
  const handleSectionUpdate = async (sectionData) => {
    try {
      let updateFunction;
      let successMessage;

      switch (currentSection) {
        case 'company':
          updateFunction = updateCompanyInfo;
          successMessage = 'Company information updated successfully';
          break;
        case 'contact':
          updateFunction = updateContactInfo;
          successMessage = 'Contact information updated successfully';
          break;
        case 'social':
          updateFunction = updateSocialMedia;
          successMessage = 'Social media links updated successfully';
          break;
        case 'seo':
          updateFunction = updateSeoSettings;
          successMessage = 'SEO settings updated successfully';
          break;
        case 'business':
          updateFunction = updateBusinessHours;
          successMessage = 'Business hours updated successfully';
          break;
        case 'integrations':
          updateFunction = updateIntegrations;
          successMessage = 'Integration settings updated successfully';
          break;
        case 'theme':
          updateFunction = updateThemeSettings;
          successMessage = 'Theme settings updated successfully';
          break;
        default:
          throw new Error('Invalid section');
      }

      await updateFunction(sectionData).unwrap();
      showSuccess(successMessage);
      setShowEditModal(false);
      refetchSettings();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update settings');
    }
  };

  const openEditModal = (section) => {
    setCurrentSection(section);
    setShowEditModal(true);
  };

  const settingsSections = [
    {
      id: 'company',
      title: 'Company Information',
      description: 'Manage company name, logo, and basic information',
      icon: <BsFillBuildingFill size={24} />,
      data: settings?.company,
      fields: [
        { label: 'Company Name', value: settings?.company?.name || 'Not set' },
        { label: 'Tagline', value: settings?.company?.tagline || 'Not set' },
        { label: 'Logo', value: settings?.company?.logo?.url ? 'Set' : 'Not set' },
        { label: 'Favicon', value: settings?.company?.favicon?.url ? 'Set' : 'Not set' }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Manage phone numbers, emails, and address',
      icon: <FiPhone size={24} />,
      data: settings?.contact,
      fields: [
        { label: 'Primary Phone', value: settings?.contact?.phone?.primary || 'Not set' },
        { label: 'Primary Email', value: settings?.contact?.email?.primary || 'Not set' },
        { label: 'Address', value: settings?.contact?.address?.city ? `${settings.contact.address.city}, ${settings.contact.address.state}` : 'Not set' },
        { label: 'WhatsApp', value: settings?.contact?.phone?.whatsapp || 'Not set' }
      ]
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Manage social media links and profiles',
      icon: <FiShare2 size={24} />,
      data: settings?.socialMedia,
      fields: [
        { label: 'Facebook', value: settings?.socialMedia?.facebook || 'Not set' },
        { label: 'Instagram', value: settings?.socialMedia?.instagram || 'Not set' },
        { label: 'LinkedIn', value: settings?.socialMedia?.linkedin || 'Not set' },
        { label: 'YouTube', value: settings?.socialMedia?.youtube || 'Not set' }
      ]
    },
    {
      id: 'seo',
      title: 'SEO Settings',
      description: 'Manage meta tags, analytics, and SEO configuration',
      icon: <FiSearch size={24} />,
      data: settings?.seo,
      fields: [
        { label: 'Meta Title', value: settings?.seo?.metaTitle || 'Not set' },
        { label: 'Meta Description', value: settings?.seo?.metaDescription || 'Not set' },
        { label: 'Keywords', value: settings?.seo?.keywords?.length ? `${settings.seo.keywords.length} keywords` : 'Not set' },
        { label: 'Google Analytics', value: settings?.seo?.googleAnalyticsId || 'Not set' }
      ]
    },
    {
      id: 'business',
      title: 'Business Hours',
      description: 'Set operating hours for each day of the week',
      icon: <FiClock size={24} />,
      data: settings?.businessHours,
      fields: [
        { label: 'Monday', value: settings?.businessHours?.monday?.isOpen ? `${settings.businessHours.monday.openTime} - ${settings.businessHours.monday.closeTime}` : 'Closed' },
        { label: 'Tuesday', value: settings?.businessHours?.tuesday?.isOpen ? `${settings.businessHours.tuesday.openTime} - ${settings.businessHours.tuesday.closeTime}` : 'Closed' },
        { label: 'Weekend', value: settings?.businessHours?.saturday?.isOpen ? 'Open' : 'Closed' }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Configure third-party services and APIs',
      icon: <FiZap size={24} />,
      data: settings?.integrations,
      fields: [
        { label: 'Google Maps', value: settings?.integrations?.googleMaps?.isEnabled ? 'Enabled' : 'Disabled' },
        { label: 'WhatsApp Business', value: settings?.integrations?.whatsapp?.isEnabled ? 'Enabled' : 'Disabled' },
        { label: 'Razorpay', value: settings?.integrations?.razorpay?.isEnabled ? 'Enabled' : 'Disabled' },
        { label: 'Mailchimp', value: settings?.integrations?.mailchimp?.isEnabled ? 'Enabled' : 'Disabled' }
      ]
    },
    {
      id: 'theme',
      title: 'Theme Settings',
      description: 'Customize colors and appearance',
      icon: <BsFillPaletteFill size={24} />,
      data: settings?.theme,
      fields: [
        { label: 'Primary Color', value: settings?.theme?.primaryColor || '#007bff' },
        { label: 'Secondary Color', value: settings?.theme?.secondaryColor || '#6c757d' },
        { label: 'Accent Color', value: settings?.theme?.accentColor || '#28a745' },
        { label: 'Font Family', value: settings?.theme?.fontFamily || 'Inter, sans-serif' }
      ]
    }
  ];

  if (settingsLoading) {
    return <LoadingSpinner size="large" text="Loading settings..." />;
  }

  return (
    <div className="settings-management">
      <div className="management-header">
        <div className="header-content">
          <h2>Site Settings</h2>
          <p>Manage your website configuration and preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {settingsSections.map((section) => (
          <motion.div
            key={section.id}
            className="settings-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: settingsSections.indexOf(section) * 0.1 }}
          >
            <div className="settings-card-header">
              <div className="settings-icon">
                {section.icon}
              </div>
              <div className="settings-info">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => openEditModal(section.id)}
              >
                <FiEdit size={16} />
                Edit
              </button>
            </div>

            <div className="settings-card-body">
              {section.fields.map((field, index) => (
                <div key={index} className="settings-field">
                  <span className="field-label">{field.label}:</span>
                  <span className="field-value">{field.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Settings Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentSection('company');
        }}
        title={`Edit ${settingsSections.find(s => s.id === currentSection)?.title || 'Settings'}`}
        size="large"
        showFooter={false}
      >
        <SettingsForm
          settings={settings}
          section={currentSection}
          onSubmit={handleSectionUpdate}
          onCancel={() => {
            setShowEditModal(false);
            setCurrentSection('company');
          }}
          isLoading={isLoading}
        />
      </FormModal>
    </div>
  );
};

export default SettingsManagement;

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
  selectSettings,
  selectCompany,
  selectContact,
  selectSocialMedia,
  selectSeo,
  selectBusinessHours,
  selectTheme,
  selectIntegrations,
  selectSettingsLoading,
  selectSettingsError,
  selectCompanyName,
  selectCompanyTagline,
  selectCompanyLogo,
  selectPrimaryPhone,
  selectPrimaryEmail,
  selectWhatsAppNumber,
  selectIsWhatsAppEnabled,
  setSettings,
  setLoading,
  setError,
} from '../store/slices/settingsSlice';
import { useGetSiteSettingsQuery } from '../store/api/settingsApi';

export const useSettings = () => {
  const dispatch = useDispatch();

  // Selectors
  const settings = useSelector(selectSettings);
  const company = useSelector(selectCompany);
  const contact = useSelector(selectContact);
  const socialMedia = useSelector(selectSocialMedia);
  const seo = useSelector(selectSeo);
  const businessHours = useSelector(selectBusinessHours);
  const theme = useSelector(selectTheme);
  const integrations = useSelector(selectIntegrations);
  const isLoading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);

  // Computed selectors
  const companyName = useSelector(selectCompanyName);
  const companyTagline = useSelector(selectCompanyTagline);
  const companyLogo = useSelector(selectCompanyLogo);
  const primaryPhone = useSelector(selectPrimaryPhone);
  const primaryEmail = useSelector(selectPrimaryEmail);
  const whatsappNumber = useSelector(selectWhatsAppNumber);
  const isWhatsAppEnabled = useSelector(selectIsWhatsAppEnabled);

  // Fetch settings from API
  const {
    data: apiSettings,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useGetSiteSettingsQuery();

  // Update Redux state when API data changes
  useEffect(() => {
    if (apiSettings) {
      dispatch(setSettings(apiSettings));
    }
  }, [apiSettings, dispatch]);

  // Update loading state
  useEffect(() => {
    dispatch(setLoading(apiLoading));
  }, [apiLoading, dispatch]);

  // Update error state
  useEffect(() => {
    if (apiError) {
      dispatch(setError(apiError.message || 'Failed to load settings'));
    }
  }, [apiError, dispatch]);

  // Utility functions
  const getBusinessHoursForDay = (day) => {
    const d = day.toLowerCase();
    const group = d === 'saturday' ? 'saturday' : d === 'sunday' ? 'sunday' : 'weekdays';
    return businessHours[group] || { isOpen: false, openTime: '09:00', closeTime: '18:00' };
  };

  const isBusinessOpen = (day = null, time = null) => {
    const currentDay = (day || new Date().toLocaleDateString('en-US', { weekday: 'long' })).toLowerCase();
    const currentTime = time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const dayHours = getBusinessHoursForDay(currentDay);
    
    if (!dayHours.isOpen) return false;
    
    return currentTime >= dayHours.openTime && currentTime <= dayHours.closeTime;
  };

  const getFormattedAddress = () => {
    const { street, city, state, zipCode, country } = contact.address;
    const parts = [street, city, state, zipCode, country].filter(Boolean);
    return parts.join(', ');
  };

  const getGoogleMapsUrl = () => {
    if (contact.coordinates.latitude && contact.coordinates.longitude) {
      return `https://www.google.com/maps?q=${contact.coordinates.latitude},${contact.coordinates.longitude}`;
    }
    const address = getFormattedAddress();
    return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
  };

  const getSocialMediaLinks = () => {
    return Object.entries(socialMedia)
      .filter(([, url]) => url)
      .map(([platform, url]) => ({ platform, url }));
  };

  const getWhatsAppUrl = (message = '') => {
    if (!whatsappNumber) return null;
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
  };

  const getPhoneUrl = (phone = primaryPhone) => {
    if (!phone) return null;
    return `tel:${phone}`;
  };

  const getEmailUrl = (email = primaryEmail, subject = '', body = '') => {
    if (!email) return null;
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (body) params.append('body', body);
    const queryString = params.toString();
    return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
  };

  // SEO helpers
  const getPageTitle = (pageTitle = '') => {
    const baseTitle = seo.metaTitle || `${companyName} - ${companyTagline}`;
    return pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
  };

  const getMetaDescription = (customDescription = '') => {
    return customDescription || seo.metaDescription || `${companyName} - ${companyTagline}. ${company.description}`.trim();
  };

  const getMetaKeywords = (additionalKeywords = []) => {
    const baseKeywords = seo.keywords || [];
    return [...baseKeywords, ...additionalKeywords].join(', ');
  };

  return {
    // State
    settings,
    company,
    contact,
    socialMedia,
    seo,
    businessHours,
    theme,
    integrations,
    isLoading,
    error,

    // Computed values
    companyName,
    companyTagline,
    companyLogo,
    primaryPhone,
    primaryEmail,
    whatsappNumber,
    isWhatsAppEnabled,

    // Utility functions
    getBusinessHoursForDay,
    isBusinessOpen,
    getFormattedAddress,
    getGoogleMapsUrl,
    getSocialMediaLinks,
    getWhatsAppUrl,
    getPhoneUrl,
    getEmailUrl,
    getPageTitle,
    getMetaDescription,
    getMetaKeywords,
    refetch,
  };
};

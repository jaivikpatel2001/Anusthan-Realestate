import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Company Information
  company: {
    name: 'Real Estate Company',
    tagline: 'Your Dream Home Awaits',
    description: '',
    logo: null,
    favicon: null,
  },

  // Contact Information
  contact: {
    phone: {
      primary: '+91-9999999999',
      secondary: '',
      whatsapp: '',
    },
    email: {
      primary: 'info@realstate.com',
      support: '',
      sales: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
    coordinates: {
      latitude: null,
      longitude: null,
    },
  },

  // Social Media Links
  socialMedia: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    pinterest: '',
  },

  // SEO Settings
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    ogImage: null,
  },

  // Business Hours
  businessHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
  },

  // Theme Settings
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    accentColor: '#28a745',
    fontFamily: 'Inter, sans-serif',
  },

  // Integrations
  integrations: {
    googleMaps: {
      isEnabled: false,
    },
    whatsapp: {
      businessNumber: '',
      isEnabled: false,
    },
  },

  // Loading and error states
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      const settings = action.payload;
      
      // Merge settings with current state, preserving structure
      if (settings.company) state.company = { ...state.company, ...settings.company };
      if (settings.contact) state.contact = { ...state.contact, ...settings.contact };
      if (settings.socialMedia) state.socialMedia = { ...state.socialMedia, ...settings.socialMedia };
      if (settings.seo) state.seo = { ...state.seo, ...settings.seo };
      if (settings.businessHours) state.businessHours = { ...state.businessHours, ...settings.businessHours };
      if (settings.theme) state.theme = { ...state.theme, ...settings.theme };
      if (settings.integrations) state.integrations = { ...state.integrations, ...settings.integrations };
      
      state.lastUpdated = Date.now();
      state.isLoading = false;
      state.error = null;
    },

    updateCompany: (state, action) => {
      state.company = { ...state.company, ...action.payload };
      state.lastUpdated = Date.now();
    },

    updateContact: (state, action) => {
      state.contact = { ...state.contact, ...action.payload };
      state.lastUpdated = Date.now();
    },

    updateSocialMedia: (state, action) => {
      state.socialMedia = { ...state.socialMedia, ...action.payload };
      state.lastUpdated = Date.now();
    },

    updateSeo: (state, action) => {
      state.seo = { ...state.seo, ...action.payload };
      state.lastUpdated = Date.now();
    },

    updateBusinessHours: (state, action) => {
      state.businessHours = { ...state.businessHours, ...action.payload };
      state.lastUpdated = Date.now();
    },

    updateTheme: (state, action) => {
      state.theme = { ...state.theme, ...action.payload };
      state.lastUpdated = Date.now();
    },

    updateIntegrations: (state, action) => {
      state.integrations = { ...state.integrations, ...action.payload };
      state.lastUpdated = Date.now();
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSettings,
  updateCompany,
  updateContact,
  updateSocialMedia,
  updateSeo,
  updateBusinessHours,
  updateTheme,
  updateIntegrations,
  setLoading,
  setError,
  clearError,
} = settingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.settings;
export const selectCompany = (state) => state.settings.company;
export const selectContact = (state) => state.settings.contact;
export const selectSocialMedia = (state) => state.settings.socialMedia;
export const selectSeo = (state) => state.settings.seo;
export const selectBusinessHours = (state) => state.settings.businessHours;
export const selectTheme = (state) => state.settings.theme;
export const selectIntegrations = (state) => state.settings.integrations;
export const selectSettingsLoading = (state) => state.settings.isLoading;
export const selectSettingsError = (state) => state.settings.error;

// Computed selectors
export const selectCompanyName = (state) => state.settings.company.name;
export const selectCompanyTagline = (state) => state.settings.company.tagline;
export const selectCompanyLogo = (state) => state.settings.company.logo;
export const selectPrimaryPhone = (state) => state.settings.contact.phone.primary;
export const selectPrimaryEmail = (state) => state.settings.contact.email.primary;
export const selectWhatsAppNumber = (state) => state.settings.contact.phone.whatsapp || state.settings.contact.phone.primary;
export const selectIsWhatsAppEnabled = (state) => state.settings.integrations.whatsapp.isEnabled;

export default settingsSlice.reducer;

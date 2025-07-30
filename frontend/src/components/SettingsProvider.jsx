import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetSiteSettingsQuery } from '../store/api/settingsApi';
import { setSettings, setLoading, setError } from '../store/slices/settingsSlice';
import { initializeUI } from '../store/slices/uiSlice';

const SettingsProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  const {
    data: settings,
    isLoading,
    error,
    isSuccess,
  } = useGetSiteSettingsQuery();

  // Initialize settings when data is loaded
  useEffect(() => {
    if (isSuccess && settings) {
      dispatch(setSettings(settings));
      
      // Apply theme colors to CSS variables
      if (settings.theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', settings.theme.primaryColor || '#007bff');
        root.style.setProperty('--secondary-color', settings.theme.secondaryColor || '#6c757d');
        root.style.setProperty('--accent-color', settings.theme.accentColor || '#28a745');
        
        if (settings.theme.fontFamily) {
          root.style.setProperty('--font-family', settings.theme.fontFamily);
        }
      }

      // Update favicon if available
      if (settings.company?.favicon?.url) {
        const favicon = document.querySelector('link[rel="icon"]') || 
                      document.querySelector('link[rel="shortcut icon"]');
        if (favicon) {
          favicon.href = settings.company.favicon.url;
        } else {
          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.href = settings.company.favicon.url;
          document.head.appendChild(newFavicon);
        }
      }

      // Update document title with company name
      if (settings.company?.name) {
        const baseTitle = settings.seo?.metaTitle || 
                         `${settings.company.name} - ${settings.company.tagline || 'Real Estate'}`;
        document.title = baseTitle;
      }
    }
  }, [isSuccess, settings, dispatch]);

  // Update loading state
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  // Update error state
  useEffect(() => {
    if (error) {
      dispatch(setError(error.message || 'Failed to load site settings'));
    }
  }, [error, dispatch]);

  // Initialize UI preferences from localStorage
  useEffect(() => {
    dispatch(initializeUI());
  }, [dispatch]);

  return children;
};

export default SettingsProvider;

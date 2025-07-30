import { apiSlice } from './apiSlice';

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get public site settings
    getSiteSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
      transformResponse: (response) => response.data.settings,
    }),

    // Get all site settings (Admin only)
    getAdminSettings: builder.query({
      query: () => '/settings/admin',
      providesTags: ['Settings'],
      transformResponse: (response) => response.data.settings,
    }),

    // Update site settings
    updateSettings: builder.mutation({
      query: (settingsData) => ({
        url: '/settings',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.settings,
    }),

    // Update company information
    updateCompanyInfo: builder.mutation({
      query: (companyData) => ({
        url: '/settings/company',
        method: 'PUT',
        body: companyData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.company,
    }),

    // Update contact information
    updateContactInfo: builder.mutation({
      query: (contactData) => ({
        url: '/settings/contact',
        method: 'PUT',
        body: contactData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.contact,
    }),

    // Update social media links
    updateSocialMedia: builder.mutation({
      query: (socialData) => ({
        url: '/settings/social-media',
        method: 'PUT',
        body: socialData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.socialMedia,
    }),

    // Update SEO settings
    updateSeoSettings: builder.mutation({
      query: (seoData) => ({
        url: '/settings/seo',
        method: 'PUT',
        body: seoData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.seo,
    }),

    // Update business hours
    updateBusinessHours: builder.mutation({
      query: (hoursData) => ({
        url: '/settings/business-hours',
        method: 'PUT',
        body: hoursData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.businessHours,
    }),

    // Update integrations
    updateIntegrations: builder.mutation({
      query: (integrationsData) => ({
        url: '/settings/integrations',
        method: 'PUT',
        body: integrationsData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.integrations,
    }),

    // Update theme settings
    updateTheme: builder.mutation({
      query: (themeData) => ({
        url: '/settings/theme',
        method: 'PUT',
        body: themeData,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response) => response.data.theme,
    }),

    // Toggle maintenance mode
    toggleMaintenance: builder.mutation({
      query: ({ maintenanceMode, maintenanceMessage }) => ({
        url: '/settings/maintenance',
        method: 'PATCH',
        body: { maintenanceMode, maintenanceMessage },
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSiteSettingsQuery,
  useGetAdminSettingsQuery,
  useUpdateSettingsMutation,
  useUpdateCompanyInfoMutation,
  useUpdateContactInfoMutation,
  useUpdateSocialMediaMutation,
  useUpdateSeoSettingsMutation,
  useUpdateBusinessHoursMutation,
  useUpdateIntegrationsMutation,
  useUpdateThemeMutation,
  useToggleMaintenanceMutation,
} = settingsApi;

// Export alias for consistency with SettingsManagement component
export const useUpdateThemeSettingsMutation = useUpdateThemeMutation;

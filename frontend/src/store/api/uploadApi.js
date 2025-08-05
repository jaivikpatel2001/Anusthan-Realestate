import { apiSlice } from './apiSlice';

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Upload site images (logo, favicon, etc.)
    uploadSiteImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/site-images',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Upload project images
    uploadProjectImages: builder.mutation({
      query: (formData) => ({
        url: '/upload/project-images',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Upload floor plans
    uploadFloorPlan: builder.mutation({
      query: (formData) => ({
        url: '/upload/floor-plans',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Upload brochures
    uploadBrochure: builder.mutation({
      query: (formData) => ({
        url: '/upload/brochures',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Upload team member images
    uploadTeamImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/team-images',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Generic image upload (for team members, etc.)
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/team-images', // Using team-images endpoint for generic images
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Get upload configuration
    getUploadConfig: builder.query({
      query: () => '/upload/config',
      transformResponse: (response) => response.data,
    }),

    // Delete file
    deleteFile: builder.mutation({
      query: ({ publicId, localPath }) => ({
        url: '/upload/delete',
        method: 'DELETE',
        body: { publicId, localPath },
      }),
    }),
  }),
});

export const {
  useUploadSiteImageMutation,
  useUploadProjectImagesMutation,
  useUploadFloorPlanMutation,
  useUploadBrochureMutation,
  useUploadTeamImageMutation,
  useUploadImageMutation,
  useGetUploadConfigQuery,
  useDeleteFileMutation,
} = uploadApi;

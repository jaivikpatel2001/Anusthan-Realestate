import { apiSlice } from './apiSlice';

export const apartmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all apartments with filtering and pagination
    getApartments: builder.query({
      query: (params = {}) => ({
        url: '/apartments',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          projectId: params.projectId || '',
          type: params.type || '',
          bedrooms: params.bedrooms || '',
          bathrooms: params.bathrooms || '',
          minPrice: params.minPrice || '',
          maxPrice: params.maxPrice || '',
          minArea: params.minArea || '',
          maxArea: params.maxArea || '',
          facing: params.facing || '',
          available: params.available || '',
          search: params.search || '',
          sort: params.sort || 'sortOrder',
        },
      }),
      providesTags: ['Apartment'],
      transformResponse: (response) => response.data,
    }),

    // Get single apartment by ID
    getApartment: builder.query({
      query: (id) => `/apartments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Apartment', id }],
      transformResponse: (response) => response.data.apartment,
    }),

    // Get apartments by project ID
    getApartmentsByProject: builder.query({
      query: ({ projectId, available, sort = 'sortOrder' }) => ({
        url: `/apartments/project/${projectId}`,
        params: { available, sort },
      }),
      providesTags: ['Apartment'],
      transformResponse: (response) => response.data.apartments,
    }),

    // Admin endpoints
    createApartment: builder.mutation({
      query: (apartmentData) => ({
        url: '/apartments',
        method: 'POST',
        body: apartmentData,
      }),
      invalidatesTags: ['Apartment'],
      transformResponse: (response) => response.data.apartment,
    }),

    updateApartment: builder.mutation({
      query: ({ id, ...apartmentData }) => ({
        url: `/apartments/${id}`,
        method: 'PUT',
        body: apartmentData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Apartment', id },
        'Apartment',
      ],
      transformResponse: (response) => response.data.apartment,
    }),

    deleteApartment: builder.mutation({
      query: (id) => ({
        url: `/apartments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Apartment'],
    }),

    // Book apartment units
    bookApartmentUnits: builder.mutation({
      query: ({ id, quantity = 1 }) => ({
        url: `/apartments/${id}/book`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Apartment', id },
        'Apartment',
      ],
      transformResponse: (response) => response.data,
    }),

    // Release apartment units
    releaseApartmentUnits: builder.mutation({
      query: ({ id, quantity = 1 }) => ({
        url: `/apartments/${id}/release`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Apartment', id },
        'Apartment',
      ],
      transformResponse: (response) => response.data,
    }),

    // Toggle apartment featured status
    toggleApartmentFeatured: builder.mutation({
      query: (id) => ({
        url: `/apartments/${id}/featured`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Apartment', id },
        'Apartment',
      ],
    }),

    // Get apartment statistics
    getApartmentStats: builder.query({
      query: (projectId) => ({
        url: '/apartments/admin/stats',
        params: projectId ? { projectId } : {},
      }),
      providesTags: ['Apartment'],
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetApartmentsQuery,
  useGetApartmentQuery,
  useGetApartmentsByProjectQuery,
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
  useBookApartmentUnitsMutation,
  useReleaseApartmentUnitsMutation,
  useToggleApartmentFeaturedMutation,
  useGetApartmentStatsQuery,
} = apartmentsApi;

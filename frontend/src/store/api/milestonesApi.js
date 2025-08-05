import { apiSlice } from './apiSlice';

export const milestonesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all active milestones (public)
    getMilestones: builder.query({
      query: (params = {}) => ({
        url: '/milestones',
        params: {
          startYear: params.startYear || '',
          endYear: params.endYear || '',
        },
      }),
      providesTags: ['Milestone'],
      transformResponse: (response) => response.data.milestones,
    }),

    // Get milestone by ID (public)
    getMilestone: builder.query({
      query: (id) => `/milestones/${id}`,
      providesTags: (result, error, id) => [{ type: 'Milestone', id }],
      transformResponse: (response) => response.data.milestone,
    }),

    // Admin endpoints
    getMilestonesAdmin: builder.query({
      query: (params = {}) => ({
        url: '/milestones/admin',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
          year: params.year || '',
        },
      }),
      providesTags: ['Milestone'],
      transformResponse: (response) => response.data,
    }),

    createMilestone: builder.mutation({
      query: (milestoneData) => ({
        url: '/milestones',
        method: 'POST',
        body: milestoneData,
      }),
      invalidatesTags: ['Milestone'],
      transformResponse: (response) => response.data.milestone,
    }),

    updateMilestone: builder.mutation({
      query: ({ id, ...milestoneData }) => ({
        url: `/milestones/${id}`,
        method: 'PUT',
        body: milestoneData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Milestone', id },
        'Milestone',
      ],
      transformResponse: (response) => response.data.milestone,
    }),

    deleteMilestone: builder.mutation({
      query: (id) => ({
        url: `/milestones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Milestone'],
    }),

    toggleMilestoneActive: builder.mutation({
      query: (id) => ({
        url: `/milestones/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Milestone', id },
        'Milestone',
      ],
    }),
  }),
});

export const {
  useGetMilestonesQuery,
  useGetMilestoneQuery,
  useGetMilestonesAdminQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  useToggleMilestoneActiveMutation,
} = milestonesApi;

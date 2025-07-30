import { apiSlice } from './apiSlice';

export const leadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create lead (Public - for brochure downloads, contact forms)
    createLead: builder.mutation({
      query: (leadData) => ({
        url: '/leads',
        method: 'POST',
        body: leadData,
      }),
      transformResponse: (response) => response.data.lead,
    }),

    // Brochure download (creates lead and returns download info)
    downloadBrochure: builder.mutation({
      query: (downloadData) => ({
        url: '/leads/brochure-download',
        method: 'POST',
        body: downloadData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Admin endpoints
    getLeads: builder.query({
      query: (params = {}) => ({
        url: '/leads',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          projectId: params.projectId || '',
          status: params.status || '',
          priority: params.priority || '',
          source: params.source || '',
          leadType: params.leadType || '',
          assignedTo: params.assignedTo || '',
          dateFrom: params.dateFrom || '',
          dateTo: params.dateTo || '',
          search: params.search || '',
          sort: params.sort || '-createdAt',
        },
      }),
      providesTags: ['Lead'],
      transformResponse: (response) => response.data,
    }),

    getLead: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
      transformResponse: (response) => response.data.lead,
    }),

    updateLead: builder.mutation({
      query: ({ id, ...leadData }) => ({
        url: `/leads/${id}`,
        method: 'PUT',
        body: leadData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        'Lead',
      ],
      transformResponse: (response) => response.data.lead,
    }),

    updateLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        'Lead',
      ],
    }),

    addContactHistory: builder.mutation({
      query: ({ id, ...contactData }) => ({
        url: `/leads/${id}/contact`,
        method: 'POST',
        body: contactData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }],
    }),

    addNote: builder.mutation({
      query: ({ id, ...noteData }) => ({
        url: `/leads/${id}/notes`,
        method: 'POST',
        body: noteData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }],
    }),

    scheduleFollowUp: builder.mutation({
      query: ({ id, ...followUpData }) => ({
        url: `/leads/${id}/follow-up`,
        method: 'PATCH',
        body: followUpData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        'Lead',
      ],
    }),

    assignLead: builder.mutation({
      query: ({ id, assignedTo }) => ({
        url: `/leads/${id}/assign`,
        method: 'PATCH',
        body: { assignedTo },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        'Lead',
      ],
    }),

    getFollowUpLeads: builder.query({
      query: (date) => ({
        url: '/leads/follow-up',
        params: { date },
      }),
      providesTags: ['Lead'],
      transformResponse: (response) => response.data,
    }),

    getLeadStats: builder.query({
      query: (params = {}) => ({
        url: '/leads/stats',
        params: {
          projectId: params.projectId || '',
          dateFrom: params.dateFrom || '',
          dateTo: params.dateTo || '',
        },
      }),
      providesTags: ['Lead'],
      transformResponse: (response) => response.data,
    }),

    updateLead: builder.mutation({
      query: ({ id, ...leadData }) => ({
        url: `/leads/${id}`,
        method: 'PUT',
        body: leadData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        'Lead',
      ],
      transformResponse: (response) => response.data.lead,
    }),

    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lead'],
    }),

    exportLeads: builder.query({
      query: (params = {}) => ({
        url: '/leads/export',
        params: {
          projectId: params.projectId || '',
          status: params.status || '',
          dateFrom: params.dateFrom || '',
          dateTo: params.dateTo || '',
          format: params.format || 'csv',
        },
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useCreateLeadMutation,
  useDownloadBrochureMutation,
  useGetLeadsQuery,
  useGetLeadQuery,
  useUpdateLeadMutation,
  useUpdateLeadStatusMutation,
  useAddContactHistoryMutation,
  useAddNoteMutation,
  useScheduleFollowUpMutation,
  useAssignLeadMutation,
  useDeleteLeadMutation,
  useGetFollowUpLeadsQuery,
  useGetLeadStatsQuery,
  useLazyExportLeadsQuery,
} = leadsApi;

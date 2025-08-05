import { apiSlice } from './apiSlice';

export const statisticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all active statistics (public)
    getStatistics: builder.query({
      query: (params = {}) => ({
        url: '/statistics',
        params: {
          location: params.location || '',
          category: params.category || '',
        },
      }),
      providesTags: ['Statistic'],
      transformResponse: (response) => response.data.statistics,
    }),

    // Get statistics by location (public)
    getStatisticsByLocation: builder.query({
      query: (location) => `/statistics/location/${location}`,
      providesTags: ['Statistic'],
      transformResponse: (response) => response.data.statistics,
    }),

    // Get footer statistics (public)
    getFooterStatistics: builder.query({
      query: () => '/statistics/footer',
      providesTags: ['Statistic'],
      transformResponse: (response) => response.data.statistics,
    }),

    // Get statistic by ID (public)
    getStatistic: builder.query({
      query: (id) => `/statistics/${id}`,
      providesTags: (result, error, id) => [{ type: 'Statistic', id }],
      transformResponse: (response) => response.data.statistic,
    }),

    // Admin endpoints
    getStatisticsAdmin: builder.query({
      query: (params = {}) => ({
        url: '/statistics/admin',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
          category: params.category || '',
        },
      }),
      providesTags: ['Statistic'],
      transformResponse: (response) => response.data,
    }),

    createStatistic: builder.mutation({
      query: (statisticData) => ({
        url: '/statistics',
        method: 'POST',
        body: statisticData,
      }),
      invalidatesTags: ['Statistic'],
      transformResponse: (response) => response.data.statistic,
    }),

    updateStatistic: builder.mutation({
      query: ({ id, ...statisticData }) => ({
        url: `/statistics/${id}`,
        method: 'PUT',
        body: statisticData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Statistic', id },
        'Statistic',
      ],
      transformResponse: (response) => response.data.statistic,
    }),

    updateStatisticValue: builder.mutation({
      query: ({ id, value }) => ({
        url: `/statistics/${id}/value`,
        method: 'PATCH',
        body: { value },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Statistic', id },
        'Statistic',
      ],
      transformResponse: (response) => response.data.statistic,
    }),

    deleteStatistic: builder.mutation({
      query: (id) => ({
        url: `/statistics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Statistic'],
    }),

    toggleStatisticActive: builder.mutation({
      query: (id) => ({
        url: `/statistics/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Statistic', id },
        'Statistic',
      ],
    }),
  }),
});

export const {
  useGetStatisticsQuery,
  useGetStatisticsByLocationQuery,
  useGetFooterStatisticsQuery,
  useGetStatisticQuery,
  useGetStatisticsAdminQuery,
  useCreateStatisticMutation,
  useUpdateStatisticMutation,
  useUpdateStatisticValueMutation,
  useDeleteStatisticMutation,
  useToggleStatisticActiveMutation,
} = statisticsApi;

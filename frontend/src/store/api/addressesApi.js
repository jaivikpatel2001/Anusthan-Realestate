import { apiSlice } from './apiSlice';

export const addressesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all active addresses (public)
    getAddresses: builder.query({
      query: (params = {}) => ({
        url: '/addresses',
        params: {
          location: params.location || '',
        },
      }),
      providesTags: ['Address'],
      transformResponse: (response) => response.data.addresses,
    }),

    // Get primary address (public)
    getPrimaryAddress: builder.query({
      query: () => '/addresses/primary',
      providesTags: ['Address'],
      transformResponse: (response) => response.data.address,
    }),

    // Get address by ID (public)
    getAddress: builder.query({
      query: (id) => `/addresses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Address', id }],
      transformResponse: (response) => response.data.address,
    }),

    // Admin endpoints
    getAddressesAdmin: builder.query({
      query: (params = {}) => ({
        url: '/addresses/admin',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
          type: params.type || '',
        },
      }),
      providesTags: ['Address'],
      transformResponse: (response) => response.data,
    }),

    createAddress: builder.mutation({
      query: (addressData) => ({
        url: '/addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['Address'],
      transformResponse: (response) => response.data.address,
    }),

    updateAddress: builder.mutation({
      query: ({ id, ...addressData }) => ({
        url: `/addresses/${id}`,
        method: 'PUT',
        body: addressData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Address', id },
        'Address',
      ],
      transformResponse: (response) => response.data.address,
    }),

    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),

    setAddressAsPrimary: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}/set-primary`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Address'],
      transformResponse: (response) => response.data.address,
    }),

    toggleAddressActive: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Address', id },
        'Address',
      ],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetPrimaryAddressQuery,
  useGetAddressQuery,
  useGetAddressesAdminQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetAddressAsPrimaryMutation,
  useToggleAddressActiveMutation,
} = addressesApi;

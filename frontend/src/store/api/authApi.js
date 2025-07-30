import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => response.data,
    }),

    // Register (Admin only)
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // Refresh token
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => response.data,
    }),

    // Get current user profile
    getProfile: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
      transformResponse: (response) => response.data.user,
    }),

    // Update user profile
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response.data.user,
    }),

    // Change password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Admin user management endpoints (these would need to be implemented in backend)
    getAllUsers: builder.query({
      query: (params = {}) => ({
        url: '/auth/users',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          role: params.role || '',
          isActive: params.isActive || '',
          search: params.search || '',
          sort: params.sort || '-createdAt',
        },
      }),
      providesTags: ['User'],
      transformResponse: (response) => response.data,
    }),

    getUserById: builder.query({
      query: (id) => `/auth/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response) => response.data.user,
    }),

    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/auth/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'User',
      ],
      transformResponse: (response) => response.data.user,
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        'User',
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} = authApi;

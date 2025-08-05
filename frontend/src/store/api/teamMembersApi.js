import { apiSlice } from './apiSlice';

export const teamMembersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all active team members (public)
    getTeamMembers: builder.query({
      query: () => '/team-members',
      providesTags: ['TeamMember'],
      transformResponse: (response) => response.data.teamMembers,
    }),

    // Get team member by ID (public)
    getTeamMember: builder.query({
      query: (id) => `/team-members/${id}`,
      providesTags: (result, error, id) => [{ type: 'TeamMember', id }],
      transformResponse: (response) => response.data.teamMember,
    }),

    // Admin endpoints
    getTeamMembersAdmin: builder.query({
      query: (params = {}) => ({
        url: '/team-members/admin',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '',
        },
      }),
      providesTags: ['TeamMember'],
      transformResponse: (response) => response.data,
    }),

    createTeamMember: builder.mutation({
      query: (teamMemberData) => ({
        url: '/team-members',
        method: 'POST',
        body: teamMemberData,
      }),
      invalidatesTags: ['TeamMember'],
      transformResponse: (response) => response.data.teamMember,
    }),

    updateTeamMember: builder.mutation({
      query: ({ id, ...teamMemberData }) => ({
        url: `/team-members/${id}`,
        method: 'PUT',
        body: teamMemberData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TeamMember', id },
        'TeamMember',
      ],
      transformResponse: (response) => response.data.teamMember,
    }),

    deleteTeamMember: builder.mutation({
      query: (id) => ({
        url: `/team-members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeamMember'],
    }),

    toggleTeamMemberActive: builder.mutation({
      query: (id) => ({
        url: `/team-members/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'TeamMember', id },
        'TeamMember',
      ],
    }),
  }),
});

export const {
  useGetTeamMembersQuery,
  useGetTeamMemberQuery,
  useGetTeamMembersAdminQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useToggleTeamMemberActiveMutation,
} = teamMembersApi;

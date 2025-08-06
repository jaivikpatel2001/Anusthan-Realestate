import { apiSlice } from './apiSlice';

const createImageUrl = (path) => {
  if (!path) return null;
  const baseUrl = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';
  if (path.startsWith(baseUrl)) {
    return path;
  }
  return `${baseUrl}${path}`;
};

export const projectsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all projects with filtering and pagination
    getProjects: builder.query({
      query: (params = {}) => ({
        url: '/projects',
        params: {
          page: params.page || 1,
          limit: params.limit || 12,
          status: params.status || '',
          category: params.category || '',
          location: params.location || '',
          minPrice: params.minPrice || '',
          maxPrice: params.maxPrice || '',
          search: params.search || '',
          sort: params.sort || '-createdAt',
          featured: params.featured || '',
        },
      }),
      providesTags: ['Project'],
      transformResponse: (response) => {
        const projects = response.data.projects;
        response.data.projects = projects.map(project => ({
          ...project,
          heroImage: createImageUrl(project.heroImage),
          images: project.images?.map(img => ({
            ...img,
            url: createImageUrl(img.url)
          })) || []
        }));
        return response.data;
      },
    }),

    // Get single project by ID or slug
    getProject: builder.query({
      query: (identifier) => `/projects/${identifier}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
      transformResponse: (response) => {
        const project = response.data.project;
        return {
          ...project,
          heroImage: createImageUrl(project.heroImage),
          images: project.images?.map(img => ({
            ...img,
            url: createImageUrl(img.url)
          })) || []
        };
      },
    }),

    // Get featured projects
    getFeaturedProjects: builder.query({
      query: () => ({
        url: '/projects',
        params: { featured: 'true', limit: 6 },
      }),
      providesTags: ['Project'],
      transformResponse: (response) => {
        const projects = response.data.projects;
        response.data.projects = projects.map(project => ({
          ...project,
          heroImage: createImageUrl(project.heroImage),
          images: project.images?.map(img => ({
            ...img,
            url: createImageUrl(img.url)
          })) || []
        }));
        return response.data;
      },
    }),

    // Get projects by status
    getProjectsByStatus: builder.query({
      query: (status) => ({
        url: '/projects',
        params: { status, limit: 100 },
      }),
      providesTags: ['Project'],
      transformResponse: (response) => {
        const projects = response.data.projects;
        response.data.projects = projects.map(project => ({
          ...project,
          heroImage: createImageUrl(project.heroImage),
          images: project.images?.map(img => ({
            ...img,
            url: createImageUrl(img.url)
          })) || []
        }));
        return response.data;
      },
    }),

    // Admin endpoints
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
      transformResponse: (response) => response.data.project,
    }),

    updateProject: builder.mutation({
      query: ({ id, ...projectData }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: projectData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        'Project',
      ],
      transformResponse: (response) => response.data.project,
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    toggleProjectFeatured: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}/featured`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Project', id },
        'Project',
      ],
    }),

    getProjectStats: builder.query({
      query: () => '/projects/admin/stats/overview',
      providesTags: ['Project'],
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetFeaturedProjectsQuery,
  useGetProjectsByStatusQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useToggleProjectFeaturedMutation,
  useGetProjectStatsQuery,
} = projectsApi;

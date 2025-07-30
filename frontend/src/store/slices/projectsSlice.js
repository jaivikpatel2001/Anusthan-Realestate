import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  currentProject: null,
  filters: {
    status: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    featured: false,
  },
  sorting: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },
    
    updateProject: (state, action) => {
      const index = state.projects.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject?._id === action.payload._id) {
        state.currentProject = action.payload;
      }
    },
    
    removeProject: (state, action) => {
      state.projects = state.projects.filter(p => p._id !== action.payload);
      if (state.currentProject?._id === action.payload) {
        state.currentProject = null;
      }
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    
    setSorting: (state, action) => {
      state.sorting = { ...state.sorting, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when sorting changes
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    incrementProjectViews: (state, action) => {
      const projectId = action.payload;
      const project = state.projects.find(p => p._id === projectId);
      if (project) {
        project.viewCount = (project.viewCount || 0) + 1;
      }
      if (state.currentProject?._id === projectId) {
        state.currentProject.viewCount = (state.currentProject.viewCount || 0) + 1;
      }
    },
  },
});

export const {
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  removeProject,
  setFilters,
  clearFilters,
  setSorting,
  setPagination,
  setCurrentPage,
  setLoading,
  setError,
  clearError,
  incrementProjectViews,
} = projectsSlice.actions;

// Selectors
export const selectProjects = (state) => state.projects.projects;
export const selectCurrentProject = (state) => state.projects.currentProject;
export const selectProjectFilters = (state) => state.projects.filters;
export const selectProjectSorting = (state) => state.projects.sorting;
export const selectProjectPagination = (state) => state.projects.pagination;
export const selectProjectsLoading = (state) => state.projects.isLoading;
export const selectProjectsError = (state) => state.projects.error;

// Computed selectors
export const selectFilteredProjects = (state) => {
  const { projects, filters } = state.projects;
  
  return projects.filter(project => {
    if (filters.status && project.status !== filters.status) return false;
    if (filters.category && project.category !== filters.category) return false;
    if (filters.location && !project.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && project.startingPrice < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && project.startingPrice > parseFloat(filters.maxPrice)) return false;
    if (filters.featured && !project.isFeatured) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${project.title} ${project.description} ${project.location}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }
    return true;
  });
};

export const selectFeaturedProjects = (state) => {
  return state.projects.projects.filter(project => project.isFeatured);
};

export const selectProjectsByStatus = (status) => (state) => {
  return state.projects.projects.filter(project => project.status === status);
};

export default projectsSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Loading states
  isGlobalLoading: false,
  loadingStates: {},
  
  // Modal states
  modals: {
    brochureDownload: {
      isOpen: false,
      projectId: null,
      projectTitle: '',
    },
    contactForm: {
      isOpen: false,
      projectId: null,
    },
    imageGallery: {
      isOpen: false,
      images: [],
      currentIndex: 0,
    },
    emiCalculator: {
      isOpen: false,
      projectId: null,
    },
  },
  
  // Toast notifications
  toasts: [],
  
  // Theme and preferences
  theme: 'light',
  sidebarCollapsed: false,
  
  // View preferences
  projectViewMode: 'grid', // 'grid' or 'list'
  
  // Search and filters UI state
  searchVisible: false,
  filtersVisible: false,
  
  // Mobile menu
  mobileMenuOpen: false,
  
  // Page states
  pageStates: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setGlobalLoading: (state, action) => {
      state.isGlobalLoading = action.payload;
    },
    
    setLoadingState: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loadingStates[key] = isLoading;
    },
    
    clearLoadingState: (state, action) => {
      delete state.loadingStates[action.payload];
    },
    
    // Modal management
    openModal: (state, action) => {
      const { modalName, data = {} } = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = { ...state.modals[modalName], isOpen: true, ...data };
      }
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = { ...initialState.modals[modalName] };
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        state.modals[modalName] = { ...initialState.modals[modalName] };
      });
    },
    
    // Toast notifications
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: 'info',
        duration: 5000,
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Theme and preferences
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed);
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', action.payload);
    },
    
    // View preferences
    setProjectViewMode: (state, action) => {
      state.projectViewMode = action.payload;
      localStorage.setItem('projectViewMode', action.payload);
    },
    
    toggleProjectViewMode: (state) => {
      state.projectViewMode = state.projectViewMode === 'grid' ? 'list' : 'grid';
      localStorage.setItem('projectViewMode', state.projectViewMode);
    },
    
    // Search and filters
    toggleSearch: (state) => {
      state.searchVisible = !state.searchVisible;
    },
    
    setSearchVisible: (state, action) => {
      state.searchVisible = action.payload;
    },
    
    toggleFilters: (state) => {
      state.filtersVisible = !state.filtersVisible;
    },
    
    setFiltersVisible: (state, action) => {
      state.filtersVisible = action.payload;
    },
    
    // Mobile menu
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Page states
    setPageState: (state, action) => {
      const { page, data } = action.payload;
      state.pageStates[page] = { ...state.pageStates[page], ...data };
    },
    
    clearPageState: (state, action) => {
      delete state.pageStates[action.payload];
    },
    
    // Initialize UI from localStorage
    initializeUI: (state) => {
      try {
        const theme = localStorage.getItem('theme');
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed');
        const projectViewMode = localStorage.getItem('projectViewMode');
        
        if (theme) state.theme = theme;
        if (sidebarCollapsed !== null) state.sidebarCollapsed = sidebarCollapsed === 'true';
        if (projectViewMode) state.projectViewMode = projectViewMode;
      } catch (error) {
        console.error('Error initializing UI state from localStorage:', error);
      }
    },
  },
});

export const {
  setGlobalLoading,
  setLoadingState,
  clearLoadingState,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setProjectViewMode,
  toggleProjectViewMode,
  toggleSearch,
  setSearchVisible,
  toggleFilters,
  setFiltersVisible,
  toggleMobileMenu,
  setMobileMenuOpen,
  setPageState,
  clearPageState,
  initializeUI,
} = uiSlice.actions;

// Selectors
export const selectIsGlobalLoading = (state) => state.ui.isGlobalLoading;
export const selectLoadingState = (key) => (state) => state.ui.loadingStates[key] || false;
export const selectModal = (modalName) => (state) => state.ui.modals[modalName];
export const selectToasts = (state) => state.ui.toasts;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectProjectViewMode = (state) => state.ui.projectViewMode;
export const selectSearchVisible = (state) => state.ui.searchVisible;
export const selectFiltersVisible = (state) => state.ui.filtersVisible;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectPageState = (page) => (state) => state.ui.pageStates[page] || {};

export default uiSlice.reducer;

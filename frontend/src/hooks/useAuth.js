import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsAdmin,
  setCredentials,
  logout as logoutAction,
} from '../store/slices/authSlice';
import { useLoginMutation, useLogoutMutation } from '../store/api/authApi';
import { useToast } from './useToast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError, showApiError } = useToast();

  // Selectors
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAdmin = useSelector(selectIsAdmin);

  // Mutations
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();

  // Login function
  const login = async (credentials) => {
    try {
      const response = await loginMutation(credentials).unwrap();
      
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      }));

      showSuccess(`Welcome back, ${response.user.name}!`);
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

      return response;
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Even if logout API fails, we should clear local state
      console.error('Logout API error:', error);
    } finally {
      dispatch(logoutAction());
      showSuccess('Logged out successfully');
      navigate('/');
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Check if user is authenticated and has admin role
  const isAuthenticatedAdmin = () => {
    return isAuthenticated && isAdmin;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.name || 'User';
  };

  // Check if token is expired (basic check)
  const isTokenExpired = () => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Auto logout if token is expired
  const checkTokenExpiry = () => {
    if (isAuthenticated && isTokenExpired()) {
      dispatch(logoutAction());
      showError('Your session has expired. Please log in again.');
      navigate('/login');
    }
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || isLoginLoading || isLogoutLoading,
    error,
    isAdmin,
    
    // Actions
    login,
    logout,
    
    // Utilities
    hasRole,
    hasAnyRole,
    isAuthenticatedAdmin,
    getUserInitials,
    getUserDisplayName,
    isTokenExpired,
    checkTokenExpiry,
  };
};

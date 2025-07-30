import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireAuth = true,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isAdmin, isLoading, checkTokenExpiry } = useAuth();
  const location = useLocation();

  // Check token expiry on route access
  checkTokenExpiry();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If admin access is required but user is not admin
  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated && 
      (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

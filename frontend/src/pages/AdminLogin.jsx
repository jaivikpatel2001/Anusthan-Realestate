import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials, setError, clearError } from '../store/slices/authSlice';
import { selectIsAuthenticated, selectAuthError, selectIsAdmin } from '../store/slices/authSlice';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const authError = useSelector(selectAuthError);

  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth error
    if (authError) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData).unwrap();
      
      // Check if user is admin
      if (result.user.role !== 'admin') {
        dispatch(setError('Access denied. Admin privileges required.'));
        showError('Access denied. Admin privileges required.');
        return;
      }

      dispatch(setCredentials(result));
      showSuccess('Welcome back, Admin!');
      
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage = error?.data?.message || 'Login failed. Please try again.';
      dispatch(setError(errorMessage));
      showError(errorMessage);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="admin-login-page">
      <SEOHead
        title="Admin Login - Elite Estate"
        description="Admin login portal for Elite Estate management system"
        keywords={['admin', 'login', 'management', 'dashboard']}
      />

      <div className="login-container">
        <motion.div
          className="login-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="login-header">
            <div className="login-icon">
              <FiShield size={48} />
            </div>
            <h1>Admin Portal</h1>
            <p>Sign in to access the management dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={validationErrors.email ? 'error' : ''}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
              {validationErrors.email && (
                <span className="error-text">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={validationErrors.password ? 'error' : ''}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors.password && (
                <span className="error-text">{validationErrors.password}</span>
              )}
            </div>

            {authError && (
              <div className="auth-error">
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" color="white" showText={false} />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              <strong>Note:</strong> This portal is restricted to authorized administrators only.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;

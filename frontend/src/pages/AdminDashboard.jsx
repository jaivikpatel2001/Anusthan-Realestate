import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiHome,
  FiFolder,
  FiUsers,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';
import { selectIsAuthenticated, selectIsAdmin, selectCurrentUser } from '../store/slices/authSlice';
import { logout } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';
import { useGetProjectsQuery } from '../store/api/projectsApi';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import '../styles/AdminDashboard.css';
import { BiBuilding } from 'react-icons/bi';
import ProjectManagement from '../components/admin/ProjectManagement';
import ApartmentManagement from '../components/admin/ApartmentManagement';
import LeadManagement from '../components/admin/LeadManagement';
import UserManagement from '../components/admin/UserManagement';
import SettingsManagement from '../components/admin/SettingsManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess } = useToast();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const currentUser = useSelector(selectCurrentUser);

  const [logoutMutation] = useLogoutMutation();
  const { data: projectsData } = useGetProjectsQuery({ limit: 100 });

  const projects = projectsData?.projects || [];

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      showSuccess('Logged out successfully');
      navigate('/admin', { replace: true });
    } catch {
      dispatch(logout());
      navigate('/admin', { replace: true });
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'projects', label: 'Projects', icon: FiFolder },
    { id: 'apartments', label: 'Apartments', icon: BiBuilding },
    { id: 'leads', label: 'Leads', icon: FiUsers },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <LoadingSpinner size="large" text="Checking authentication..." />;
  }

  return (
    <div className="admin-dashboard">
      <SEOHead
        title="Admin Dashboard - Elite Estate"
        description="Admin dashboard for managing Elite Estate projects, apartments, and leads"
        keywords={['admin', 'dashboard', 'management', 'projects']}
      />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>Welcome, {currentUser?.name}</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>
            {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <motion.div
              className="overview-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="stats-grid">
                <motion.div className="stat-card" variants={itemVariants}>
                  <div className="stat-icon">
                    <FiFolder />
                  </div>
                  <div className="stat-info">
                    <h3>{projects.length}</h3>
                    <p>Total Projects</p>
                  </div>
                </motion.div>

                <motion.div className="stat-card" variants={itemVariants}>
                  <div className="stat-icon">
                    <BiBuilding />
                  </div>
                  <div className="stat-info">
                    <h3>{projects.filter(p => p.status === 'ongoing').length}</h3>
                    <p>Ongoing Projects</p>
                  </div>
                </motion.div>

                <motion.div className="stat-card" variants={itemVariants}>
                  <div className="stat-icon">
                    <FiUsers />
                  </div>
                  <div className="stat-info">
                    <h3>{projects.filter(p => p.status === 'completed').length}</h3>
                    <p>Completed Projects</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              className="projects-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <ProjectManagement />
            </motion.div>
          )}

          {activeTab === 'apartments' && (
            <motion.div
              className="apartments-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <ApartmentManagement />
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div
              className="leads-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <LeadManagement />
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              className="users-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <UserManagement />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              className="settings-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <SettingsManagement />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

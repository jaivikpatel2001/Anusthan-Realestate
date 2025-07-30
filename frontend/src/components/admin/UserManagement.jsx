import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiShield, FiUser, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { 
  useGetAllUsersQuery, 
  useRegisterMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation,
  useToggleUserStatusMutation
} from '../../store/api/authApi';
import { useToast } from '../../hooks/useToast';
import { DataTable, FormModal, ConfirmDialog } from './index';
import UserForm from './UserForm';
import LoadingSpinner from '../LoadingSpinner';

const UserManagement = () => {
  const { showSuccess, showError } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // API hooks
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    refetch: refetchUsers 
  } = useGetAllUsersQuery({
    search: searchTerm,
    role: roleFilter,
    isActive: statusFilter,
    limit: 100
  });

  const [createUser, { isLoading: createLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [toggleUserStatus, { isLoading: toggleLoading }] = useToggleUserStatusMutation();

  const users = usersData?.users || [];

  // Handle create user
  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData).unwrap();
      showSuccess('User created successfully');
      setShowCreateModal(false);
      refetchUsers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create user');
    }
  };

  // Handle update user
  const handleUpdateUser = async (userData) => {
    try {
      await updateUser({ 
        id: selectedUser._id, 
        ...userData 
      }).unwrap();
      showSuccess('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      refetchUsers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update user');
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser._id).unwrap();
      showSuccess('User deleted successfully');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      refetchUsers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete user');
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(user._id).unwrap();
      showSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      refetchUsers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update user status');
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      title: 'User',
      render: (value, user) => (
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="user-details">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <span className={`role-badge ${value}`}>
          {value === 'admin' ? <FiShield size={12} /> : <FiUser size={12} />}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge ${value ? 'active' : 'inactive'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value) => formatDate(value)
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value) => formatDate(value)
    }
  ];

  // Table actions
  const actions = [
    {
      icon: <FiEye size={16} />,
      className: 'view',
      title: 'View User Details',
      onClick: (user) => {
        // Open user detail modal or navigate to detail page
        console.log('View user:', user._id);
      }
    },
    {
      icon: <FiEdit size={16} />,
      className: 'edit',
      title: 'Edit User',
      onClick: (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
      }
    },
    {
      icon: (user) => user.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />,
      className: (user) => user.isActive ? 'deactivate' : 'activate',
      title: (user) => user.isActive ? 'Deactivate User' : 'Activate User',
      onClick: handleToggleStatus
    },
    {
      icon: <FiTrash2 size={16} />,
      className: 'delete',
      title: 'Delete User',
      onClick: (user) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
      }
    }
  ];

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' }
  ];

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  if (usersLoading) {
    return <LoadingSpinner size="large" text="Loading users..." />;
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <div className="header-content">
          <h2>User Management</h2>
          <p>Manage system users and their permissions</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus size={18} />
          Add New User
        </button>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="management-content">
        <DataTable
          data={users}
          columns={columns}
          actions={actions}
          loading={usersLoading}
          searchable={false} // We handle search externally
          emptyMessage="No users found. Create your first user to get started."
        />
      </div>

      {/* Create User Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="medium"
        showFooter={false}
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
          isEdit={false}
        />
      </FormModal>

      {/* Edit User Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        title="Edit User"
        size="medium"
        showFooter={false}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleUpdateUser}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          isLoading={updateLoading}
          isEdit={true}
        />
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone and will remove all user data.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default UserManagement;

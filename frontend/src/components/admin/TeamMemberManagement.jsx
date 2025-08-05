import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';
import {
  useGetTeamMembersAdminQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useToggleTeamMemberActiveMutation,
} from '../../store/api/teamMembersApi';
import { useToast } from '../../hooks/useToast';
import DataTable from './DataTable';
import FormModal from './FormModal';
import ConfirmDialog from './ConfirmDialog';
import TeamMemberForm from './TeamMemberForm';

const TeamMemberManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { showSuccess, showError } = useToast();

  // API hooks
  const {
    data: teamMembersData,
    isLoading: membersLoading,
    refetch: refetchMembers
  } = useGetTeamMembersAdminQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter
  });

  const [createMember, { isLoading: createLoading }] = useCreateTeamMemberMutation();
  const [updateMember, { isLoading: updateLoading }] = useUpdateTeamMemberMutation();
  const [deleteMember, { isLoading: deleteLoading }] = useDeleteTeamMemberMutation();
  const [toggleActive, { isLoading: toggleLoading }] = useToggleTeamMemberActiveMutation();

  const teamMembers = teamMembersData?.teamMembers || [];
  const pagination = teamMembersData?.pagination || {};

  // Handle create team member
  const handleCreateMember = async (memberData) => {
    try {
      await createMember(memberData).unwrap();
      showSuccess('Team member created successfully');
      setShowCreateModal(false);
      refetchMembers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create team member');
    }
  };

  // Handle update team member
  const handleUpdateMember = async (memberData) => {
    try {
      await updateMember({ id: selectedMember._id, ...memberData }).unwrap();
      showSuccess('Team member updated successfully');
      setShowEditModal(false);
      setSelectedMember(null);
      refetchMembers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update team member');
    }
  };

  // Handle delete team member
  const handleDeleteMember = async () => {
    try {
      await deleteMember(selectedMember._id).unwrap();
      showSuccess('Team member deleted successfully');
      setShowDeleteDialog(false);
      setSelectedMember(null);
      refetchMembers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete team member');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (member) => {
    try {
      await toggleActive(member._id).unwrap();
      showSuccess(`Team member ${member.isActive ? 'deactivated' : 'activated'} successfully`);
      refetchMembers();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update team member status');
    }
  };

  // Table columns
  const columns = [
    {
      key: 'image',
      label: 'Photo',
      render: (member) => (
        <div className="member-avatar">
          <img 
            src={member.image?.url} 
            alt={member.name}
            className="avatar-img"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
            }}
          />
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'position',
      label: 'Position',
      sortable: true
    },
    {
      key: 'experienceYears',
      label: 'Experience',
      render: (member) => `${member.experienceYears}+ years`
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (member) => (
        <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
          {member.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (member) => new Date(member.createdAt).toLocaleDateString()
    }
  ];

  // Table actions
  const actions = [
    { className:'edit',
      label: 'Edit',
      icon: <FiEdit/>,
      onClick: (member) => {
        setSelectedMember(member);
        setShowEditModal(true);
      }
    },
    {
      label: (member) => member.isActive ? 'Deactivate' : 'Activate',
      icon: (member) => member.isActive ? FiEyeOff : FiEye,
      onClick: handleToggleActive,
      loading: toggleLoading
    },
    { className:'delete',
      label: 'Delete',
      icon: <FiTrash2/>,
      onClick: (member) => {
        setSelectedMember(member);
        setShowDeleteDialog(true);
      },
      
    }
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: 'Activate Selected',
      onClick: (selectedIds) => {
        // Implement bulk activate
        console.log('Activate:', selectedIds);
      }
    },
    {
      label: 'Deactivate Selected',
      onClick: (selectedIds) => {
        // Implement bulk deactivate
        console.log('Deactivate:', selectedIds);
      }
    },
    {
      label: 'Delete Selected',
      onClick: (selectedIds) => {
        // Implement bulk delete
        console.log('Delete:', selectedIds);
      },
      className: 'danger'
    }
  ];

  return (
    <div className="team-member-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2>Team Members</h2>
          <p>Manage your team member profiles and information</p>
        </div>
        <div className="header-right">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={20} />
            Add Team Member
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            className='search-input'
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="management-content">
        <DataTable
          data={teamMembers}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          selectable={true}
          loading={membersLoading}
          searchable={false} // We handle search externally
          pagination={false} // We handle pagination externally
          emptyMessage="No team members found. Add your first team member to get started."
        />

        {/* External Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="external-pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} entries
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Member Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Team Member"
        size="large"
        onSubmit={handleCreateMember}
        isLoading={createLoading}
      >
        <TeamMemberForm
          onSubmit={handleCreateMember}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
          showSubmitButton={false}
        />
      </FormModal>

      {/* Edit Team Member Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        title="Edit Team Member"
        size="large"
        onSubmit={handleUpdateMember}
        isLoading={updateLoading}
      >
        <TeamMemberForm
          initialData={selectedMember}
          onSubmit={handleUpdateMember}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          isLoading={updateLoading}
          showSubmitButton={false}
        />
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedMember(null);
        }}
        onConfirm={handleDeleteMember}
        title="Delete Team Member"
        message={`Are you sure you want to delete "${selectedMember?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TeamMemberManagement;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch, FiCalendar } from 'react-icons/fi';
import {
  useGetMilestonesAdminQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  useToggleMilestoneActiveMutation,
} from '../../store/api/milestonesApi';
import { useToast } from '../../hooks/useToast';
import DataTable from './DataTable';
import FormModal from './FormModal';
import ConfirmDialog from './ConfirmDialog';
import MilestoneForm from './MilestoneForm';

const MilestoneManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { showSuccess, showError } = useToast();

  // API hooks
  const {
    data: milestonesData,
    isLoading: milestonesLoading,
    refetch: refetchMilestones
  } = useGetMilestonesAdminQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
    year: yearFilter
  });

  const [createMilestone, { isLoading: createLoading }] = useCreateMilestoneMutation();
  const [updateMilestone, { isLoading: updateLoading }] = useUpdateMilestoneMutation();
  const [deleteMilestone, { isLoading: deleteLoading }] = useDeleteMilestoneMutation();
  const [toggleActive, { isLoading: toggleLoading }] = useToggleMilestoneActiveMutation();

  const milestones = milestonesData?.milestones || [];
  const pagination = milestonesData?.pagination || {};

  // Handle create milestone
  const handleCreateMilestone = async (milestoneData) => {
    try {
      await createMilestone(milestoneData).unwrap();
      showSuccess('Milestone created successfully');
      setShowCreateModal(false);
      refetchMilestones();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create milestone');
    }
  };

  // Handle update milestone
  const handleUpdateMilestone = async (milestoneData) => {
    try {
      await updateMilestone({ id: selectedMilestone._id, ...milestoneData }).unwrap();
      showSuccess('Milestone updated successfully');
      setShowEditModal(false);
      setSelectedMilestone(null);
      refetchMilestones();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update milestone');
    }
  };

  // Handle delete milestone
  const handleDeleteMilestone = async () => {
    try {
      await deleteMilestone(selectedMilestone._id).unwrap();
      showSuccess('Milestone deleted successfully');
      setShowDeleteDialog(false);
      setSelectedMilestone(null);
      refetchMilestones();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete milestone');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (milestone) => {
    try {
      await toggleActive(milestone._id).unwrap();
      showSuccess(`Milestone ${milestone.isActive ? 'deactivated' : 'activated'} successfully`);
      refetchMilestones();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update milestone status');
    }
  };

  // Generate year options for filter
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear + 5; year >= 1990; year--) {
    yearOptions.push(year.toString());
  }

  // Table columns
  const columns = [
    {
      key: 'year',
      label: 'Year',
      sortable: true,
      render: (milestone) => (
        <span className="year-badge">{milestone.year}</span>
      )
    },
    {
      key: 'heading',
      label: 'Heading',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      render: (milestone) => (
        <span className="description-preview">
          {milestone.description.length > 100 
            ? `${milestone.description.substring(0, 100)}...` 
            : milestone.description
          }
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (milestone) => (
        <span className={`status-badge ${milestone.isActive ? 'active' : 'inactive'}`}>
          {milestone.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (milestone) => new Date(milestone.createdAt).toLocaleDateString()
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      icon: FiEdit,
      onClick: (milestone) => {
        setSelectedMilestone(milestone);
        setShowEditModal(true);
      }
    },
    {
      label: (milestone) => milestone.isActive ? 'Deactivate' : 'Activate',
      icon: (milestone) => milestone.isActive ? FiEyeOff : FiEye,
      onClick: handleToggleActive,
      loading: toggleLoading
    },
    {
      label: 'Delete',
      icon: FiTrash2,
      onClick: (milestone) => {
        setSelectedMilestone(milestone);
        setShowDeleteDialog(true);
      },
      className: 'danger'
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
    <div className="milestone-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2>Company Milestones</h2>
          <p>Manage your company's journey and key achievements</p>
        </div>
        <div className="header-right">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={20} />
            Add Milestone
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search milestones..."
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
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Years</option>
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="management-content">
        <DataTable
          data={milestones}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          selectable={true}
          loading={milestonesLoading}
          searchable={false} // We handle search externally
          pagination={false} // We handle pagination externally
          emptyMessage="No milestones found. Add your first milestone to get started."
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

      {/* Create Milestone Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Milestone"
        size="large"
        onSubmit={handleCreateMilestone}
        isLoading={createLoading}
      >
        <MilestoneForm
          onSubmit={handleCreateMilestone}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
          showSubmitButton={false}
        />
      </FormModal>

      {/* Edit Milestone Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMilestone(null);
        }}
        title="Edit Milestone"
        size="large"
        onSubmit={handleUpdateMilestone}
        isLoading={updateLoading}
      >
        <MilestoneForm
          initialData={selectedMilestone}
          onSubmit={handleUpdateMilestone}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedMilestone(null);
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
          setSelectedMilestone(null);
        }}
        onConfirm={handleDeleteMilestone}
        title="Delete Milestone"
        message={`Are you sure you want to delete the milestone "${selectedMilestone?.heading}" from ${selectedMilestone?.year}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default MilestoneManagement;

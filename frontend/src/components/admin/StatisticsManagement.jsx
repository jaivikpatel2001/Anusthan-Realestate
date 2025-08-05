import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch, FiBarChart } from 'react-icons/fi';
import {
  useGetStatisticsAdminQuery,
  useCreateStatisticMutation,
  useUpdateStatisticMutation,
  useDeleteStatisticMutation,
  useToggleStatisticActiveMutation,
} from '../../store/api/statisticsApi';
import { useToast } from '../../hooks/useToast';
import DataTable from './DataTable';
import FormModal from './FormModal';
import ConfirmDialog from './ConfirmDialog';
import StatisticForm from './StatisticForm';

const StatisticsManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStatistic, setSelectedStatistic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { showSuccess, showError } = useToast();

  // API hooks
  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    refetch: refetchStatistics
  } = useGetStatisticsAdminQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
    category: categoryFilter
  });

  const [createStatistic, { isLoading: createLoading }] = useCreateStatisticMutation();
  const [updateStatistic, { isLoading: updateLoading }] = useUpdateStatisticMutation();
  const [deleteStatistic, { isLoading: deleteLoading }] = useDeleteStatisticMutation();
  const [toggleActive, { isLoading: toggleLoading }] = useToggleStatisticActiveMutation();

  const statistics = statisticsData?.statistics || [];
  const pagination = statisticsData?.pagination || {};

  // Handle create statistic
  const handleCreateStatistic = async (statisticData) => {
    try {
      await createStatistic(statisticData).unwrap();
      showSuccess('Statistic created successfully');
      setShowCreateModal(false);
      refetchStatistics();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create statistic');
    }
  };

  // Handle update statistic
  const handleUpdateStatistic = async (statisticData) => {
    try {
      await updateStatistic({ id: selectedStatistic._id, ...statisticData }).unwrap();
      showSuccess('Statistic updated successfully');
      setShowEditModal(false);
      setSelectedStatistic(null);
      refetchStatistics();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update statistic');
    }
  };

  // Handle delete statistic
  const handleDeleteStatistic = async () => {
    try {
      await deleteStatistic(selectedStatistic._id).unwrap();
      showSuccess('Statistic deleted successfully');
      setShowDeleteDialog(false);
      setSelectedStatistic(null);
      refetchStatistics();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete statistic');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (statistic) => {
    try {
      await toggleActive(statistic._id).unwrap();
      showSuccess(`Statistic ${statistic.isActive ? 'deactivated' : 'activated'} successfully`);
      refetchStatistics();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update statistic status');
    }
  };

  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'company', label: 'Company' },
    { value: 'projects', label: 'Projects' },
    { value: 'clients', label: 'Clients' },
    { value: 'experience', label: 'Experience' },
    { value: 'achievements', label: 'Achievements' },
    { value: 'other', label: 'Other' }
  ];

  // Table columns
  const columns = [
    {
      key: 'key',
      label: 'Key',
      sortable: true,
      render: (statistic) => (
        <code className="statistic-key">{statistic.key}</code>
      )
    },
    {
      key: 'label',
      label: 'Label',
      sortable: true
    },
    {
      key: 'value',
      label: 'Value',
      render: (statistic) => (
        <span className="statistic-value">
          {statistic.prefix}{statistic.value}{statistic.suffix}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (statistic) => (
        <span className={`category-badge ${statistic.category}`}>
          {statistic.category}
        </span>
      )
    },
    {
      key: 'locations',
      label: 'Display Locations',
      render: (statistic) => {
        const locations = [];
        if (statistic.showOnHomePage) locations.push('Home');
        if (statistic.showOnAboutPage) locations.push('About');
        if (statistic.showOnFooter) locations.push('Footer');
        return locations.length > 0 ? locations.join(', ') : 'None';
      }
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (statistic) => (
        <span className={`status-badge ${statistic.isActive ? 'active' : 'inactive'}`}>
          {statistic.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (statistic) => new Date(statistic.lastUpdated).toLocaleDateString()
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      icon: FiEdit,
      onClick: (statistic) => {
        setSelectedStatistic(statistic);
        setShowEditModal(true);
      }
    },
    {
      label: (statistic) => statistic.isActive ? 'Deactivate' : 'Activate',
      icon: (statistic) => statistic.isActive ? FiEyeOff : FiEye,
      onClick: handleToggleActive,
      loading: toggleLoading
    },
    {
      label: 'Delete',
      icon: FiTrash2,
      onClick: (statistic) => {
        setSelectedStatistic(statistic);
        setShowDeleteDialog(true);
      },
      className: 'danger'
    }
  ];

  return (
    <div className="statistics-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2>Site Statistics</h2>
          <p>Manage dynamic numbers and statistics displayed across your website</p>
        </div>
        <div className="header-right">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={20} />
            Add Statistic
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search statistics..."
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="management-content">
        <DataTable
          data={statistics}
          columns={columns}
          actions={actions}
          selectable={true}
          loading={statisticsLoading}
          searchable={false} // We handle search externally
          pagination={false} // We handle pagination externally
          emptyMessage="No statistics found. Add your first statistic to get started."
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

      {/* Create Statistic Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Statistic"
        size="large"
        onSubmit={handleCreateStatistic}
        isLoading={createLoading}
      >
        <StatisticForm
          onSubmit={handleCreateStatistic}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
          showSubmitButton={false}
        />
      </FormModal>

      {/* Edit Statistic Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStatistic(null);
        }}
        title="Edit Statistic"
        size="large"
        onSubmit={handleUpdateStatistic}
        isLoading={updateLoading}
      >
        <StatisticForm
          initialData={selectedStatistic}
          onSubmit={handleUpdateStatistic}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedStatistic(null);
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
          setSelectedStatistic(null);
        }}
        onConfirm={handleDeleteStatistic}
        title="Delete Statistic"
        message={`Are you sure you want to delete the statistic "${selectedStatistic?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default StatisticsManagement;

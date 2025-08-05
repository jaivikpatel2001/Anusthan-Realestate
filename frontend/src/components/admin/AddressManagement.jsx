import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch, FiMapPin, FiStar } from 'react-icons/fi';
import {
  useGetAddressesAdminQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetAddressAsPrimaryMutation,
  useToggleAddressActiveMutation,
} from '../../store/api/addressesApi';
import { useToast } from '../../hooks/useToast';
import DataTable from './DataTable';
import FormModal from './FormModal';
import ConfirmDialog from './ConfirmDialog';
import AddressForm from './AddressForm';

const AddressManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { showSuccess, showError } = useToast();

  // API hooks
  const {
    data: addressesData,
    isLoading: addressesLoading,
    refetch: refetchAddresses
  } = useGetAddressesAdminQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
    type: typeFilter
  });

  const [createAddress, { isLoading: createLoading }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updateLoading }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deleteLoading }] = useDeleteAddressMutation();
  const [setAsPrimary, { isLoading: primaryLoading }] = useSetAddressAsPrimaryMutation();
  const [toggleActive, { isLoading: toggleLoading }] = useToggleAddressActiveMutation();

  const addresses = addressesData?.addresses || [];
  const pagination = addressesData?.pagination || {};

  // Handle create address
  const handleCreateAddress = async (addressData) => {
    try {
      await createAddress(addressData).unwrap();
      showSuccess('Address created successfully');
      setShowCreateModal(false);
      refetchAddresses();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create address');
    }
  };

  // Handle update address
  const handleUpdateAddress = async (addressData) => {
    try {
      await updateAddress({ id: selectedAddress._id, ...addressData }).unwrap();
      showSuccess('Address updated successfully');
      setShowEditModal(false);
      setSelectedAddress(null);
      refetchAddresses();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update address');
    }
  };

  // Handle delete address
  const handleDeleteAddress = async () => {
    try {
      await deleteAddress(selectedAddress._id).unwrap();
      showSuccess('Address deleted successfully');
      setShowDeleteDialog(false);
      setSelectedAddress(null);
      refetchAddresses();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete address');
    }
  };

  // Handle set as primary
  const handleSetAsPrimary = async (address) => {
    try {
      await setAsPrimary(address._id).unwrap();
      showSuccess('Address set as primary successfully');
      refetchAddresses();
    } catch (error) {
      showError(error?.data?.message || 'Failed to set address as primary');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (address) => {
    try {
      await toggleActive(address._id).unwrap();
      showSuccess(`Address ${address.isActive ? 'deactivated' : 'activated'} successfully`);
      refetchAddresses();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update address status');
    }
  };

  // Type options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'headquarters', label: 'Headquarters' },
    { value: 'branch', label: 'Branch Office' },
    { value: 'sales_office', label: 'Sales Office' },
    { value: 'site_office', label: 'Site Office' },
    { value: 'other', label: 'Other' }
  ];

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (address) => (
        <div className="address-name">
          {address.isPrimary && <FiStar className="primary-icon" />}
          {address.name}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (address) => (
        <span className={`type-badge ${address.type}`}>
          {address.type.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (address) => (
        <div className="address-preview">
          {address.addressLine1}
          {address.city && `, ${address.city}`}
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (address) => (
        <div className="contact-info">
          {address.phone && <div>{address.phone}</div>}
          {address.email && <div>{address.email}</div>}
        </div>
      )
    },
    {
      key: 'locations',
      label: 'Display On',
      render: (address) => {
        const locations = [];
        if (address.showOnWebsite) locations.push('Website');
        if (address.showOnFooter) locations.push('Footer');
        if (address.showOnContactPage) locations.push('Contact');
        return locations.length > 0 ? locations.join(', ') : 'None';
      }
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (address) => (
        <span className={`status-badge ${address.isActive ? 'active' : 'inactive'}`}>
          {address.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'Set as Primary',
      icon: FiStar,
      onClick: handleSetAsPrimary,
      loading: primaryLoading,
      show: (address) => !address.isPrimary
    },
    {
      label: 'Edit',
      icon: FiEdit,
      onClick: (address) => {
        setSelectedAddress(address);
        setShowEditModal(true);
      }
    },
    {
      label: (address) => address.isActive ? 'Deactivate' : 'Activate',
      icon: (address) => address.isActive ? FiEyeOff : FiEye,
      onClick: handleToggleActive,
      loading: toggleLoading
    },
    {
      label: 'Delete',
      icon: FiTrash2,
      onClick: (address) => {
        setSelectedAddress(address);
        setShowDeleteDialog(true);
      },
      className: 'danger',
      show: (address) => !address.isPrimary
    }
  ];

  return (
    <div className="address-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2>Company Addresses</h2>
          <p>Manage your company locations and contact information</p>
        </div>
        <div className="header-right">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={20} />
            Add Address
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search addresses..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="management-content">
        <DataTable
          data={addresses}
          columns={columns}
          actions={actions}
          selectable={true}
          loading={addressesLoading}
          searchable={false} // We handle search externally
          pagination={false} // We handle pagination externally
          emptyMessage="No addresses found. Add your first address to get started."
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

      {/* Create Address Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Address"
        size="large"
        onSubmit={handleCreateAddress}
        isLoading={createLoading}
      >
        <AddressForm
          onSubmit={handleCreateAddress}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
          showSubmitButton={false}
        />
      </FormModal>

      {/* Edit Address Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAddress(null);
        }}
        title="Edit Address"
        size="large"
        onSubmit={handleUpdateAddress}
        isLoading={updateLoading}
      >
        <AddressForm
          initialData={selectedAddress}
          onSubmit={handleUpdateAddress}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedAddress(null);
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
          setSelectedAddress(null);
        }}
        onConfirm={handleDeleteAddress}
        title="Delete Address"
        message={`Are you sure you want to delete "${selectedAddress?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default AddressManagement;

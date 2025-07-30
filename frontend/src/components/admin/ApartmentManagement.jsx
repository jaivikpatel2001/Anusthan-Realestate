import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiHome, FiTrendingUp, FiTrendingDown, FiToggleLeft, FiStar } from 'react-icons/fi';
import { 
  useGetApartmentsQuery, 
  useCreateApartmentMutation, 
  useUpdateApartmentMutation, 
  useDeleteApartmentMutation,
  useBookApartmentUnitsMutation,
  useReleaseApartmentUnitsMutation
} from '../../store/api/apartmentsApi';
import { useGetProjectsQuery } from '../../store/api/projectsApi';
import { useToast } from '../../hooks/useToast';
import { DataTable, FormModal, ConfirmDialog, FormField } from './index';
import ApartmentForm from './ApartmentForm';
import LoadingSpinner from '../LoadingSpinner';

const ApartmentManagement = () => {
  const { showSuccess, showError } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [bookingType, setBookingType] = useState('book'); // 'book' or 'release'

  // API hooks
  const { 
    data: apartmentsData, 
    isLoading: apartmentsLoading, 
    refetch: refetchApartments 
  } = useGetApartmentsQuery({
    search: searchTerm,
    projectId: projectFilter,
    type: typeFilter,
    available: availabilityFilter,
    limit: 100
  });

  const { data: projectsData } = useGetProjectsQuery({ limit: 100 });

  const [createApartment, { isLoading: createLoading }] = useCreateApartmentMutation();
  const [updateApartment, { isLoading: updateLoading }] = useUpdateApartmentMutation();
  const [deleteApartment, { isLoading: deleteLoading }] = useDeleteApartmentMutation();
  const [bookUnits, { isLoading: bookLoading }] = useBookApartmentUnitsMutation();
  const [releaseUnits, { isLoading: releaseLoading }] = useReleaseApartmentUnitsMutation();

  const apartments = apartmentsData?.apartments || [];
  const projects = projectsData?.projects || [];

  // Handle create apartment
  const handleCreateApartment = async (apartmentData) => {
    try {
      await createApartment(apartmentData).unwrap();
      showSuccess('Apartment created successfully');
      setShowCreateModal(false);
      refetchApartments();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create apartment');
    }
  };

  // Handle update apartment
  const handleUpdateApartment = async (apartmentData) => {
    try {
      await updateApartment({ 
        id: selectedApartment._id, 
        ...apartmentData 
      }).unwrap();
      showSuccess('Apartment updated successfully');
      setShowEditModal(false);
      setSelectedApartment(null);
      refetchApartments();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update apartment');
    }
  };

  // Handle delete apartment
  const handleDeleteApartment = async () => {
    try {
      await deleteApartment(selectedApartment._id).unwrap();
      showSuccess('Apartment deleted successfully');
      setShowDeleteDialog(false);
      setSelectedApartment(null);
      refetchApartments();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete apartment');
    }
  };

  // Handle booking/releasing units
  const handleBookingSubmit = async () => {
    try {
      if (bookingType === 'book') {
        await bookUnits({ 
          id: selectedApartment._id, 
          quantity: bookingQuantity 
        }).unwrap();
        showSuccess(`${bookingQuantity} unit(s) booked successfully`);
      } else {
        await releaseUnits({ 
          id: selectedApartment._id, 
          quantity: bookingQuantity 
        }).unwrap();
        showSuccess(`${bookingQuantity} unit(s) released successfully`);
      }
      setShowBookingModal(false);
      setSelectedApartment(null);
      setBookingQuantity(1);
      refetchApartments();
    } catch (error) {
      showError(error?.data?.message || `Failed to ${bookingType} units`);
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'type',
      title: 'Type',
      render: (value, apartment) => (
        <div className="apartment-info">
          <strong>{apartment.type}</strong>
          <small>{apartment.bedrooms}BR • {apartment.bathrooms}BA</small>
        </div>
      )
    },
    {
      key: 'projectId',
      title: 'Project',
      render: (value, apartment) => (
        <div className="project-info">
          <strong>{apartment.projectId?.title || 'N/A'}</strong>
          <small>{apartment.projectId?.location || ''}</small>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Price',
      render: (value, apartment) => (
        <div className="price-info">
          <strong>₹{(apartment.price?.base / 100000).toFixed(1)}L</strong>
          {apartment.price?.perSqFt && (
            <small>₹{apartment.price.perSqFt}/sq ft</small>
          )}
        </div>
      )
    },
    {
      key: 'area',
      title: 'Area',
      render: (value, apartment) => {
        const area = apartment.area?.carpet || apartment.area?.builtUp || apartment.area?.superBuiltUp;
        return area ? `${area} sq ft` : '-';
      }
    },
    {
      key: 'availability',
      title: 'Availability',
      render: (value, apartment) => (
        <div className="availability-info">
          <span className={`availability-badge ${apartment.availability?.isAvailable ? 'available' : 'sold-out'}`}>
            {apartment.availability?.availableUnits || 0}/{apartment.availability?.totalUnits || 0}
          </span>
          <small>{apartment.availability?.isAvailable ? 'Available' : 'Sold Out'}</small>
        </div>
      )
    },
    {
      key: 'facing',
      title: 'Facing',
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    {
      key: 'isFeatured',
      title: 'Featured',
      render: (value) => (
        <span className={`featured-badge ${value ? 'yes' : 'no'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      icon: <FiEye size={16} />,
      className: 'view',
      title: 'View Apartment',
      onClick: (apartment) => {
        // Navigate to apartment detail or open preview modal
        console.log('View apartment:', apartment._id);
      }
    },
    {
      icon: <FiEdit size={16} />,
      className: 'edit',
      title: 'Edit Apartment',
      onClick: (apartment) => {
        setSelectedApartment(apartment);
        setShowEditModal(true);
      }
    },
    {
      icon: <FiTrendingUp size={16} />,
      className: 'book',
      title: 'Book Units',
      onClick: (apartment) => {
        setSelectedApartment(apartment);
        setBookingType('book');
        setShowBookingModal(true);
      }
    },
    {
      icon: <FiTrendingDown size={16} />,
      className: 'release',
      title: 'Release Units',
      onClick: (apartment) => {
        setSelectedApartment(apartment);
        setBookingType('release');
        setShowBookingModal(true);
      }
    },
    {
      icon: <FiTrash2 size={16} />,
      className: 'delete',
      title: 'Delete Apartment',
      onClick: (apartment) => {
        setSelectedApartment(apartment);
        setShowDeleteDialog(true);
      }
    }
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: 'Delete Selected',
      icon: <FiTrash2 size={14} />,
      onClick: async (selectedIds) => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} apartments? This action cannot be undone.`)) {
          try {
            await Promise.all(selectedIds.map(id => deleteApartment(id).unwrap()));
            showSuccess(`${selectedIds.length} apartments deleted successfully`);
            refetchApartments();
          } catch (error) {
            showError('Failed to delete some apartments');
          }
        }
      },
      className: 'danger',
      title: 'Delete selected apartments'
    },
    {
      label: 'Toggle Status',
      icon: <FiToggleLeft size={14} />,
      onClick: () => showError('Bulk status toggle not implemented yet'),
      className: 'warning',
      title: 'Toggle active status for selected apartments'
    },
    {
      label: 'Toggle Featured',
      icon: <FiStar size={14} />,
      onClick: () => showError('Bulk featured toggle not implemented yet'),
      className: 'info',
      title: 'Toggle featured status for selected apartments'
    }
  ];

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.title
  }));

  if (apartmentsLoading) {
    return <LoadingSpinner size="large" text="Loading apartments..." />;
  }

  return (
    <div className="apartment-management">
      <div className="management-header">
        <div className="header-content">
          <h2>Apartment Management</h2>
          <p>Manage apartment configurations and availability</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus size={18} />
          Add New Apartment
        </button>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search apartments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Projects</option>
            {projectOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="1RK">1 RK</option>
            <option value="1BHK">1 BHK</option>
            <option value="2BHK">2 BHK</option>
            <option value="3BHK">3 BHK</option>
            <option value="4BHK">4 BHK</option>
            <option value="5BHK">5 BHK</option>
            <option value="Penthouse">Penthouse</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Sold Out</option>
          </select>
        </div>
      </div>

      <div className="management-content">
        <DataTable
          data={apartments}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          selectable={true}
          loading={apartmentsLoading}
          searchable={false} // We handle search externally
          emptyMessage="No apartments found. Create your first apartment configuration to get started."
        />
      </div>

      {/* Create Apartment Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Apartment"
        size="large"
        showFooter={false}
      >
        <ApartmentForm
          onSubmit={handleCreateApartment}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
        />
      </FormModal>

      {/* Edit Apartment Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedApartment(null);
        }}
        title="Edit Apartment"
        size="large"
        showFooter={false}
      >
        <ApartmentForm
          apartment={selectedApartment}
          onSubmit={handleUpdateApartment}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedApartment(null);
          }}
          isLoading={updateLoading}
        />
      </FormModal>

      {/* Booking Modal */}
      <FormModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedApartment(null);
          setBookingQuantity(1);
        }}
        title={`${bookingType === 'book' ? 'Book' : 'Release'} Units`}
        size="small"
        onSubmit={handleBookingSubmit}
        isLoading={bookLoading || releaseLoading}
        submitText={bookingType === 'book' ? 'Book Units' : 'Release Units'}
      >
        <div className="booking-form">
          <p>
            <strong>{selectedApartment?.type}</strong> in{' '}
            <strong>{selectedApartment?.projectId?.title}</strong>
          </p>
          <p>
            Available Units: {selectedApartment?.availability?.availableUnits || 0} / {selectedApartment?.availability?.totalUnits || 0}
          </p>
          
          <FormField
            label={`Number of units to ${bookingType}`}
            name="quantity"
            type="number"
            min="1"
            max={bookingType === 'book' ? selectedApartment?.availability?.availableUnits : selectedApartment?.availability?.soldUnits}
            value={bookingQuantity}
            onChange={(name, value) => setBookingQuantity(Number(value))}
            required
          />
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedApartment(null);
        }}
        onConfirm={handleDeleteApartment}
        title="Delete Apartment"
        message={`Are you sure you want to delete this ${selectedApartment?.type} apartment? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ApartmentManagement;

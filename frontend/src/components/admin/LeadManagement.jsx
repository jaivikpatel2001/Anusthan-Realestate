import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiPhone, FiMail, FiUser, FiCalendar } from 'react-icons/fi';
import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useUpdateLeadStatusMutation,
  useDeleteLeadMutation
} from '../../store/api/leadsApi';
import { useGetProjectsQuery } from '../../store/api/projectsApi';
import { useToast } from '../../hooks/useToast';
import { DataTable, FormModal, ConfirmDialog, FormField } from './index';
import LeadForm from './LeadForm';
import LoadingSpinner from '../LoadingSpinner';

const LeadManagement = () => {
  const { showSuccess, showError } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // API hooks
  const { 
    data: leadsData, 
    isLoading: leadsLoading, 
    refetch: refetchLeads 
  } = useGetLeadsQuery({
    search: searchTerm,
    projectId: projectFilter,
    status: statusFilter,
    priority: priorityFilter,
    source: sourceFilter,
    limit: 100
  });

  const { data: projectsData } = useGetProjectsQuery({ limit: 100 });

  const [createLead, { isLoading: createLoading }] = useCreateLeadMutation();
  const [updateLead, { isLoading: updateLoading }] = useUpdateLeadMutation();
  const [updateLeadStatus, { isLoading: updateStatusLoading }] = useUpdateLeadStatusMutation();
  const [deleteLead, { isLoading: deleteLoading }] = useDeleteLeadMutation();

  const leads = leadsData?.leads || [];
  const projects = projectsData?.projects || [];
  
  // Handle create lead
  const handleCreateLead = async (leadData) => {
    try {
      await createLead(leadData).unwrap();
      showSuccess('Lead created successfully');
      setShowCreateModal(false);
      refetchLeads();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create lead');
    }
  };

  // Handle update lead
  const handleUpdateLead = async (leadData) => {
    try {
      await updateLead({
        id: selectedLead._id,
        ...leadData
      }).unwrap();
      showSuccess('Lead updated successfully');
      setShowEditModal(false);
      setSelectedLead(null);
      refetchLeads();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update lead');
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      await updateLeadStatus({ 
        id: selectedLead._id, 
        status: newStatus 
      }).unwrap();
      showSuccess('Lead status updated successfully');
      setShowStatusModal(false);
      setSelectedLead(null);
      setNewStatus('');
      refetchLeads();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update lead status');
    }
  };

  // Handle delete lead
  const handleDeleteLead = async () => {
    try {
      await deleteLead(selectedLead._id).unwrap();
      showSuccess('Lead deleted successfully');
      setShowDeleteDialog(false);
      setSelectedLead(null);
      refetchLeads();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete lead');
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

  // Format phone number helper
  const formatPhone = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      title: 'Lead',
      render: (value, lead) => (
        <div className="lead-info">
          <strong>{lead.name || 'N/A'}</strong>
          <small>{formatPhone(lead.mobile)}</small>
          {lead.email && <small>{lead.email}</small>}
        </div>
      )
    },
    {
      key: 'projectId',
      title: 'Project',
      render: (value, lead) => (
        <div className="project-info">
          <strong>{lead.projectId?.title || 'N/A'}</strong>
          <small>{lead.projectId?.location || ''}</small>
        </div>
      )
    },
    {
      key: 'leadType',
      title: 'Type',
      render: (value) => (
        <span className={`lead-type-badge ${value}`}>
          {value?.replace('_', ' ').toUpperCase() || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badgelead ${value}`}>
          {value?.replace('_', ' ').toUpperCase() || 'NEW'}
        </span>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value) => (
        <span className={`priority-badge ${value}`}>
          {value?.toUpperCase() || 'MEDIUM'}
        </span>
      )
    },
    {
      key: 'source',
      title: 'Source',
      render: (value) => value?.replace('_', ' ').toUpperCase() || 'WEBSITE'
    },
    {
      key: 'budget',
      title: 'Budget',
      render: (value, lead) => {
        if (!lead.budget?.min && !lead.budget?.max) return '-';
        const min = lead.budget?.min ? `₹${(lead.budget.min / 100000).toFixed(1)}L` : '';
        const max = lead.budget?.max ? `₹${(lead.budget.max / 100000).toFixed(1)}L` : '';
        if (min && max) return `${min} - ${max}`;
        return min || max;
      }
    },
    {
      key: 'followUpDate',
      title: 'Follow-up',
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
      title: 'View Lead Details',
      onClick: (lead) => {
        // Open lead detail modal or navigate to detail page
        console.log('View lead:', lead._id);
      }
    },
    {
      icon: <FiEdit size={16} />,
      className: 'edit',
      title: 'Edit Lead',
      onClick: (lead) => {
        setSelectedLead(lead);
        setShowEditModal(true);
      }
    },
    {
      icon: <FiUser size={16} />,
      className: 'status',
      title: 'Update Status',
      onClick: (lead) => {
        setSelectedLead(lead);
        setNewStatus(lead.status);
        setShowStatusModal(true);
      }
    },
    {
      icon: <FiPhone size={16} />,
      className: 'call',
      title: 'Call Lead',
      onClick: (lead) => {
        if (lead.mobile) {
          window.open(`tel:${lead.mobile}`, '_self');
        }
      }
    },
    {
      icon: <FiMail size={16} />,
      className: 'email',
      title: 'Email Lead',
      onClick: (lead) => {
        if (lead.email) {
          window.open(`mailto:${lead.email}`, '_self');
        }
      }
    },
    {
      icon: <FiTrash2 size={16} />,
      className: 'delete',
      title: 'Delete Lead',
      onClick: (lead) => {
        setSelectedLead(lead);
        setShowDeleteDialog(true);
      }
    }
  ];

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'interested', label: 'Interested' },
    { value: 'not_interested', label: 'Not Interested' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'other', label: 'Other' }
  ];

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.title
  }));

  if (leadsLoading) {
    return <LoadingSpinner size="large" text="Loading leads..." />;
  }

  return (
    <div className="lead-management">
      <div className="management-header">
        <div className="header-content">
          <h2>Lead Management</h2>
          <p>Manage and track all your leads</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus size={18} />
          Add New Lead
        </button>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search leads..."
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

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Priority</option>
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Sources</option>
            {sourceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="management-content">
        <DataTable
          data={leads}
          columns={columns}
          actions={actions}
          loading={leadsLoading}
          searchable={false} // We handle search externally
          emptyMessage="No leads found. Create your first lead to get started."
        />
      </div>

      {/* Create Lead Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Lead"
        size="large"
        showFooter={false}
      >
        <LeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
        />
      </FormModal>

      {/* Edit Lead Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLead(null);
        }}
        title="Edit Lead"
        size="large"
        showFooter={false}
      >
        <LeadForm
          lead={selectedLead}
          onSubmit={handleUpdateLead}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedLead(null);
          }}
          isLoading={updateLoading}
        />
      </FormModal>

      {/* Status Update Modal */}
      <FormModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedLead(null);
          setNewStatus('');
        }}
        title="Update Lead Status"
        size="small"
        onSubmit={handleStatusUpdate}
        isLoading={updateStatusLoading}
        submitText="Update Status"
      >
        <div className="status-form">
          <p>
            <strong>{selectedLead?.name || 'Lead'}</strong> - {selectedLead?.mobile}
          </p>
          <p>Current Status: <span className={`status-badge ${selectedLead?.status}`}>
            {selectedLead?.status?.replace('_', ' ').toUpperCase()}
          </span></p>
          
          <FormField
            label="New Status"
            name="status"
            type="select"
            value={newStatus}
            onChange={(name, value) => setNewStatus(value)}
            options={statusOptions}
            required
          />
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedLead(null);
        }}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead "${selectedLead?.name || selectedLead?.mobile}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default LeadManagement;

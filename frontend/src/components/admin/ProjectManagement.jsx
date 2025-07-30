import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, FiToggleLeft, FiToggleRight, FiStar } from 'react-icons/fi';
import { 
  useGetProjectsQuery, 
  useCreateProjectMutation, 
  useUpdateProjectMutation, 
  useDeleteProjectMutation 
} from '../../store/api/projectsApi';
import { useToast } from '../../hooks/useToast';
import { DataTable, FormModal, ConfirmDialog } from './index';
import ProjectForm from './ProjectForm';
import LoadingSpinner from '../LoadingSpinner';

const ProjectManagement = () => {
  const { showSuccess, showError } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // API hooks
  const { 
    data: projectsData, 
    isLoading: projectsLoading, 
    refetch: refetchProjects 
  } = useGetProjectsQuery({
    search: searchTerm,
    status: statusFilter,
    category: categoryFilter,
    limit: 100
  });

  const [createProject, { isLoading: createLoading }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updateLoading }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: deleteLoading }] = useDeleteProjectMutation();

  const projects = projectsData?.projects || [];

  // Handle bulk operations
  const handleBulkDelete = async (selectedIds) => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} projects? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedIds.map(id => deleteProject(id).unwrap()));
        showSuccess(`${selectedIds.length} projects deleted successfully`);
        refetchProjects();
      } catch (error) {
        showError('Failed to delete some projects');
      }
    }
  };

  const handleBulkToggleStatus = async (selectedIds) => {
    // This would require a bulk update endpoint in the backend
    showError('Bulk status toggle not implemented yet');
  };

  const handleBulkToggleFeatured = async (selectedIds) => {
    // This would require a bulk update endpoint in the backend
    showError('Bulk featured toggle not implemented yet');
  };

  // Handle create project
  const handleCreateProject = async (projectData) => {
    try {
      await createProject(projectData).unwrap();
      showSuccess('Project created successfully');
      setShowCreateModal(false);
      refetchProjects();
    } catch (error) {
      showError(error?.data?.message || 'Failed to create project');
    }
  };

  // Handle update project
  const handleUpdateProject = async (projectData) => {
    try {
      await updateProject({ 
        id: selectedProject._id, 
        ...projectData 
      }).unwrap();
      showSuccess('Project updated successfully');
      setShowEditModal(false);
      setSelectedProject(null);
      refetchProjects();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update project');
    }
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    try {
      await deleteProject(selectedProject._id).unwrap();
      showSuccess('Project deleted successfully');
      setShowDeleteDialog(false);
      setSelectedProject(null);
      refetchProjects();
    } catch (error) {
      showError(error?.data?.message || 'Failed to delete project');
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      title: 'Project',
      render: (value, project) => (
        <div className="project-info">
          <strong>{project.title}</strong>
          <small>{project.location}</small>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (value) => (
        <span className={`category-badge ${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge ${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'startingPrice',
      title: 'Starting Price',
      render: (value) => value ? `₹${(value / 100000).toFixed(1)}L` : '-'
    },
    {
      key: 'totalUnits',
      title: 'Units',
      render: (value, project) => `${project.availableUnits || 0}/${value || 0}`
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (value) => (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${value || 0}%` }}
          />
          <span>{value || 0}%</span>
        </div>
      )
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
      title: 'View Project',
      onClick: (project) => {
        window.open(`/projects/${project._id}`, '_blank');
      }
    },
    {
      icon: <FiEdit size={16} />,
      className: 'edit',
      title: 'Edit Project',
      onClick: (project) => {
        setSelectedProject(project);
        setShowEditModal(true);
      }
    },
    {
      icon: <FiTrash2 size={16} />,
      className: 'delete',
      title: 'Delete Project',
      onClick: (project) => {
        setSelectedProject(project);
        setShowDeleteDialog(true);
      }
    }
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: 'Delete Selected',
      icon: <FiTrash2 size={14} />,
      onClick: handleBulkDelete,
      className: 'danger',
      title: 'Delete selected projects'
    },
    {
      label: 'Toggle Status',
      icon: <FiToggleLeft size={14} />,
      onClick: handleBulkToggleStatus,
      className: 'warning',
      title: 'Toggle active status for selected projects'
    },
    {
      label: 'Toggle Featured',
      icon: <FiStar size={14} />,
      onClick: handleBulkToggleFeatured,
      className: 'info',
      title: 'Toggle featured status for selected projects'
    }
  ];

  if (projectsLoading) {
    return <LoadingSpinner size="large" text="Loading projects..." />;
  }

  return (
    <div className="project-management">
      <div className="management-header">
        <div className="header-content">
          <h2>Project Management</h2>
          <p>Manage all your real estate projects</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus size={18} />
          Add New Project
        </button>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      <div className="management-content">
        <DataTable
          data={projects}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          selectable={true}
          loading={projectsLoading}
          searchable={false} // We handle search externally
          emptyMessage="No projects found. Create your first project to get started."
        />
      </div>

      {/* Create Project Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="large"
        onSubmit={handleCreateProject}
        isLoading={createLoading}
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createLoading}
        />
      </FormModal>

      {/* Edit Project Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        title="Edit Project"
        size="large"
        onSubmit={handleUpdateProject}
        isLoading={updateLoading}
      >
        <ProjectForm
          project={selectedProject}
          onSubmit={handleUpdateProject}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          isLoading={updateLoading}
        />
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ProjectManagement;

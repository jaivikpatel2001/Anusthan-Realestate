import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { useGetProjectsQuery } from '../store/api/projectsApi';
import { InlineLoading } from '../components/LoadingSpinner';
import ProjectCard from '../components/ProjectCard';
import SEOHead from '../components/SEOHead';
import '../styles/Projects.css';

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { data: projectsData, isLoading, error } = useGetProjectsQuery({
    status: statusFilter === 'all' ? '' : statusFilter,
    search: searchQuery,
    limit: 50
  });

  const projects = projectsData?.projects || [];

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    setSearchParams(params, { replace: true });
  }, [statusFilter, searchQuery, setSearchParams]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const filterOptions = ['all', 'upcoming', 'ongoing', 'completed'];

  return (
    <section className="projects-page" ref={ref}>
      <SEOHead
        title="All Projects - Elite Estate"
        description="Explore our complete portfolio of real estate projects including upcoming, ongoing, and completed developments."
        keywords={['projects', 'real estate', 'properties', 'developments']}
      />

      <div className="container">
        <motion.div
          className="page-header"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={titleVariants}
        >
          <h1>Our Projects</h1>
          <p>Explore our portfolio of premium real estate developments</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="filters-section"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3 }}
        >
          <div className="filter-buttons">
            {filterOptions.map(option => (
              <button
                key={option}
                className={`filter-btn ${statusFilter === option ? 'active' : ''}`}
                onClick={() => handleStatusChange(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <InlineLoading text="Loading projects..." size="large" />
        ) : error ? (
          <div className="error-message">
            <p>Failed to load projects. Please try again later.</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="no-projects">
            <FiFilter size={48} />
            <h3>No Projects Found</h3>
            <p>Try adjusting your filters or search to see more results.</p>
          </div>
        ) : (
          <motion.div
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project._id}
                project={project}
                index={index}
                inView={inView}
                showViewDetails={true}
              />
            ))}
          </motion.div>
        )}

        {/* Results Count */}
        {projects.length > 0 && (
          <motion.div
            className="results-info"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p>Showing {projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </motion.div>
        )}
      </div>

    </section>
  );
};

export default Projects;
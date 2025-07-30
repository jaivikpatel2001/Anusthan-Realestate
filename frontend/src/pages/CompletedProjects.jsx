import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { useGetProjectsByStatusQuery } from '../store/api/projectsApi';
import ProjectCard from '../components/ProjectCard';
import { InlineLoading } from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import '../styles/CompletedProjectsPage.css';

const CompletedProjects = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch completed projects from API
  const { data: completedProjects = [], isLoading, error } = useGetProjectsByStatusQuery('completed');

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  // Filter projects by category
  const filteredProjects = activeFilter === 'all'
    ? completedProjects
    : completedProjects.filter(project => project.category === activeFilter);

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

  return (
    <div className="completed-projects-page">
      <SEOHead
        title="Completed Projects - Elite Estate"
        description="Explore our portfolio of successfully completed real estate projects that showcase our commitment to excellence and innovation."
        keywords={['completed projects', 'real estate', 'portfolio', 'delivered projects']}
      />

      <div className="container">
        {/* Page Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="page-title">Completed Projects</h1>
          <p className="page-subtitle">
            Explore our portfolio of successfully completed projects that showcase our commitment to excellence and innovation.
          </p>

          {/* Statistics */}
          <div className="completion-stats">
            <div className="stat-item">
              <span className="stat-number">{completedProjects.length}+</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Client Satisfaction</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Awards Won</span>
            </div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          className="filter-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {['all', 'residential', 'commercial', 'mixed'].map((filter) => (
            <motion.button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterChange(filter)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter === 'all' ? 'All Projects' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <InlineLoading text="Loading completed projects..." size="large" />
        ) : error ? (
          <div className="error-message">
            <p>Failed to load completed projects. Please try again later.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="no-projects">
            <h3>No Completed Projects Found</h3>
            <p>We haven't completed any projects in this category yet.</p>
          </div>
        ) : (
          <motion.div
            className="completed-projects-grid"
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {filteredProjects.map((project, index) => (
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
        {filteredProjects.length > 0 && (
          <motion.div
            className="results-info"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p>Showing {filteredProjects.length} completed project{filteredProjects.length !== 1 ? 's' : ''}</p>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default CompletedProjects;

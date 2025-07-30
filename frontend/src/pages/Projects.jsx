import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { useGetProjectsQuery } from '../store/api/projectsApi';
import { InlineLoading } from '../components/LoadingSpinner';
import ProjectCard from '../components/ProjectCard';
import SEOHead from '../components/SEOHead';
import '../styles/Projects.css';

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Fetch projects with filters
  const { data: projectsData, isLoading, error } = useGetProjectsQuery({
    ...filters,
    limit: 50
  });

  const projects = projectsData?.projects || [];

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
    });
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
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="mixed">Mixed Use</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="clear-filters" onClick={clearFilters}>
                Clear All
              </button>
            </div>
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
            <p>Try adjusting your filters to see more results.</p>
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
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

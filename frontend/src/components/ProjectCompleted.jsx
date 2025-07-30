import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectCompleted = ({ projects, activeFilter, onFilterChange, setSelectedProject }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'mixed', label: 'Mixed-Use' }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <>
      {/* Filter Buttons */}
      <motion.div
        className="filter-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        className="completed-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              className="completed-card"
              variants={itemVariants}
              layout
              whileHover={{ y: -5 }}
              onClick={() => setSelectedProject(project)}
            >
              <div className="completed-image">
                <img src={project.image} alt={project.title} />
                <div className="image-overlay">
                  <motion.div
                    className="overlay-content"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="view-gallery">View Gallery</span>
                  </motion.div>
                </div>
              </div>

              <div className="completed-content">
                <div className="completed-header">
                  <h3 className="completed-title">{project.title}</h3>
                  <span className="completed-year">{project.year}</span>
                </div>
                
                <p className="completed-location">{project.location}</p>
                
                <div className="completed-stats">
                  <div className="stat-item">
                    <span className="stat-value">{project.units}</span>
                    <span className="stat-label">Units</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{project.value}</span>
                    <span className="stat-label">Value</span>
                  </div>
                </div>

                <div className="completed-features">
                  {project.features.slice(0, 2).map((feature, idx) => (
                    <span key={idx} className="feature-badge">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default ProjectCompleted;

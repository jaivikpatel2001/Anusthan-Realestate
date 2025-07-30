import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../styles/CompletedProjects.css';

const CompletedProjects = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: "Crystal Heights",
      location: "New York",
      category: "residential",
      year: "2023",
      units: 150,
      value: "$450M",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      description: "A stunning 40-story residential tower featuring luxury amenities and panoramic city views.",
      features: ["Luxury Amenities", "City Views", "Smart Home Tech", "Concierge Service"]
    },
    {
      id: 2,
      title: "Marina Bay Complex",
      location: "San Francisco",
      category: "commercial",
      year: "2022",
      units: 75,
      value: "$320M",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      description: "Modern commercial complex with premium office spaces and retail outlets.",
      features: ["Premium Offices", "Retail Spaces", "Conference Centers", "Parking Garage"]
    },
    {
      id: 3,
      title: "Sunset Villas",
      location: "Los Angeles",
      category: "residential",
      year: "2023",
      units: 24,
      value: "$180M",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      description: "Exclusive luxury villas with private pools and stunning sunset views.",
      features: ["Private Pools", "Sunset Views", "Luxury Finishes", "Landscaped Gardens"]
    },
    {
      id: 4,
      title: "Tech Hub Center",
      location: "Seattle",
      category: "commercial",
      year: "2022",
      units: 200,
      value: "$280M",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      description: "State-of-the-art technology hub with flexible office spaces and innovation labs.",
      features: ["Innovation Labs", "Flexible Spaces", "High-Speed Internet", "Collaboration Areas"]
    },
    {
      id: 5,
      title: "Riverside Apartments",
      location: "Portland",
      category: "residential",
      year: "2021",
      units: 180,
      value: "$220M",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      description: "Eco-friendly apartment complex with river views and sustainable features.",
      features: ["River Views", "Eco-Friendly", "Community Garden", "Bike Storage"]
    },
    {
      id: 6,
      title: "Downtown Plaza",
      location: "Chicago",
      category: "mixed",
      year: "2023",
      units: 300,
      value: "$520M",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      description: "Mixed-use development combining residential, commercial, and retail spaces.",
      features: ["Mixed-Use", "Retail Spaces", "Public Plaza", "Transit Access"]
    }
  ];

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'mixed', label: 'Mixed-Use' }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

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

  return (
    <section id="completed" className="completed-projects" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">
            Completed <span className="title-accent">Projects</span>
          </h2>
          <p className="section-subtitle">
            Explore our portfolio of successfully delivered projects that stand as testaments to our excellence
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          className="filter-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
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
          animate={inView ? "visible" : "hidden"}
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
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="project-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close"
                onClick={() => setSelectedProject(null)}
              >
                ×
              </button>
              
              <div className="modal-gallery">
                {selectedProject.gallery.map((image, idx) => (
                  <img key={idx} src={image} alt={`${selectedProject.title} ${idx + 1}`} />
                ))}
              </div>
              
              <div className="modal-info">
                <h3>{selectedProject.title}</h3>
                <p className="modal-location">{selectedProject.location}</p>
                <p className="modal-description">{selectedProject.description}</p>
                
                <div className="modal-features">
                  {selectedProject.features.map((feature, idx) => (
                    <span key={idx} className="modal-feature">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CompletedProjects;

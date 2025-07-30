import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiHome, 
  FiCalendar, 
  FiTrendingUp,
  FiDownload,
  FiPhone,
  FiMail,
  FiShare2
} from 'react-icons/fi';
import { useGetProjectQuery } from '../store/api/projectsApi';
import { InlineLoading } from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import '../styles/ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { data: project, isLoading, error } = useGetProjectQuery(id);

  const formatPrice = (price) => {
    if (!price) return 'Price on Request';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const getStatusColor = () => {
    switch (project?.status) {
      case 'upcoming': return 'var(--status-upcoming)';
      case 'ongoing': return 'var(--status-ongoing)';
      case 'completed': return 'var(--status-completed)';
      default: return 'var(--text-secondary)';
    }
  };

  const getExpectedCompletion = () => {
    if (project?.timeline?.expectedCompletion) {
      return new Date(project.timeline.expectedCompletion).getFullYear();
    }
    if (project?.timeline?.actualCompletion) {
      return new Date(project.timeline.actualCompletion).getFullYear();
    }
    return 'TBD';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.shortDescription || project.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="project-detail-loading">
        <InlineLoading text="Loading project details..." size="large" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-error">
        <div className="error-content">
          <h2>Project Not Found</h2>
          <p>The project you're looking for doesn't exist or has been removed.</p>
          <Link to="/projects" className="back-to-projects">
            <FiArrowLeft size={18} />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const images = project.images || [];
  const heroImage = project.heroImage || images[0]?.url;

  return (
    <main className="project-detail">
      <SEOHead
        title={`${project.title} - Elite Estate`}
        description={project.shortDescription || project.description}
        keywords={[project.title, project.location, project.category, 'real estate']}
      />

      {/* Hero Section */}
      <section className="project-hero">
        <div className="hero-background">
          <img 
            src={heroImage} 
            alt={project.title}
            className="hero-image"
          />
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <div className="container">
            <motion.div
              className="hero-info"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link to="/projects" className="back-link">
                <FiArrowLeft size={18} />
                Back to Projects
              </Link>
              
              <div className="project-badges">
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor() }}
                >
                  {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                </span>
                {project.isFeatured && (
                  <span className="featured-badge">
                    <FiTrendingUp size={14} />
                    Featured
                  </span>
                )}
              </div>

              <h1 className="project-title">{project.title}</h1>
              
              <div className="project-location">
                <FiMapPin size={18} />
                <span>{project.location}</span>
              </div>

              <p className="project-description">
                {project.shortDescription || project.description}
              </p>

              <div className="hero-actions">
                <button 
                  className="contact-btn primary"
                  onClick={() => setShowContactForm(true)}
                >
                  <FiPhone size={18} />
                  Contact Us
                </button>
                
                {project.brochure?.url && (
                  <a 
                    href={project.brochure.url}
                    className="contact-btn secondary"
                    download
                  >
                    <FiDownload size={18} />
                    Download Brochure
                  </a>
                )}
                
                <button 
                  className="contact-btn secondary"
                  onClick={handleShare}
                >
                  <FiShare2 size={18} />
                  Share
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="project-details-section" ref={ref}>
        <div className="container">
          <motion.div
            className="details-grid"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            {/* Key Information */}
            <div className="detail-card">
              <h3>Key Information</h3>
              <div className="detail-items">
                <div className="detail-item">
                  <FiHome size={20} />
                  <div>
                    <span className="label">Total Units</span>
                    <span className="value">{project.totalUnits || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FiCalendar size={20} />
                  <div>
                    <span className="label">
                      {project.status === 'completed' ? 'Completed' : 'Expected Completion'}
                    </span>
                    <span className="value">{getExpectedCompletion()}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FiTrendingUp size={20} />
                  <div>
                    <span className="label">Price Range</span>
                    <span className="value">
                      {formatPrice(project.startingPrice)}
                      {project.maxPrice && project.maxPrice !== project.startingPrice && 
                        ` - ${formatPrice(project.maxPrice)}`
                      }
                    </span>
                  </div>
                </div>

                {project.status === 'ongoing' && project.progress !== undefined && (
                  <div className="detail-item">
                    <div className="progress-info">
                      <span className="label">Construction Progress</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="value">{project.progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {project.amenities && project.amenities.length > 0 && (
              <div className="detail-card">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {project.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <div className="amenity-icon">
                        {amenity.icon || '🏠'}
                      </div>
                      <div>
                        <h4>{amenity.name}</h4>
                        {amenity.description && (
                          <p>{amenity.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="detail-card">
                <h3>Features</h3>
                <div className="features-list">
                  {project.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ProjectDetail;

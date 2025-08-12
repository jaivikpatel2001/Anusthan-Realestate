import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDownloadBrochureMutation } from '../store/api/leadsApi';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiShare2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiFileText
} from 'react-icons/fi';
import { useGetProjectQuery } from '../store/api/projectsApi';
import { InlineLoading } from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { useToast } from '../hooks/useToast';
import { downloadPDF } from '../utils/pdfDownload';
import '../styles/ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();



  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showBrochureForm, setShowBrochureForm] = useState(false);
  const [brochureFormData, setBrochureFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });

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
      showSuccess('Link copied to clipboard!');
    }
  };

  // Handle brochure download with lead capture
  const handleBrochureDownload = () => {
    setShowBrochureForm(true);
  };

  const [downloadBrochure] = useDownloadBrochureMutation();

  const handleBrochureFormSubmit = async (e) => {
    e.preventDefault();

    if (!brochureFormData.name || !brochureFormData.email || !brochureFormData.mobile) {
      showError('Please fill in all fields');
      return;
    }

    const mobileClean = String(brochureFormData.mobile || '').replace(/[^\d]/g, '');
    if (!/^[6-9]\d{9}$/.test(mobileClean)) {
      showError('Please enter a valid 10-digit mobile number');
      return;
    }

    const loadingToast = showSuccess('Processing your request...', { autoClose: false });

    try {
      console.log('Submitting brochure form with data:', { ...brochureFormData, mobile: mobileClean, projectId: project._id });

      const response = await downloadBrochure({
        name: brochureFormData.name,
        email: brochureFormData.email,
        mobile: mobileClean,
        projectId: project._id
      }).unwrap();

      console.log('API response received:', response);

      // Close loading toast
      if (loadingToast && typeof loadingToast.close === 'function') {
        loadingToast.close();
      }

      setShowBrochureForm(false);
      setBrochureFormData({ name: '', email: '', mobile: '' });

      const brochureUrl = response?.brochureUrl;
      const projectTitle = response?.projectTitle || project.title;

      if (brochureUrl) {
        await downloadPDF(brochureUrl, `${projectTitle}-brochure.pdf`, showError);
        showSuccess('Brochure download started!');
      } else {
        throw new Error('Brochure URL not found in the API response.');
      }

    } catch (error) {
      console.error('Brochure form submission error:', error);
      showError(error?.data?.message || error.message || 'Failed to submit form. Please try again.');

      // Close loading toast on error
      if (loadingToast && typeof loadingToast.close === 'function') {
        loadingToast.close();
      }
    }
  };

  // Image gallery navigation
  const nextImage = () => {
    const allImages = [project.heroImage, ...(project.images || []).map(img => img.url)].filter(Boolean);
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    const allImages = [project.heroImage, ...(project.images || []).map(img => img.url)].filter(Boolean);
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openImageGallery = (index = 0) => {
    setSelectedImageIndex(index);
    setShowImageGallery(true);
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
                <Link
                  to="/contact"
                  className="contact-btn primary"
                >
                  <FiPhone size={18} />
                  Contact Us
                </Link>
                
                {project.brochure?.url && (
                  <button
                    className="contact-btn secondary"
                    onClick={handleBrochureDownload}
                  >
                    <FiDownload size={18} />
                    Get Brochure
                  </button>
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
            <div className="key-information-card">
              <h3>Key Information</h3>
              <div className="key-info-grid">
                {project.totalUnits && (
                  <div className="key-info-item">
                    <span className="info-label">Total Units:</span>
                    <span className="info-value">{project.totalUnits}</span>
                  </div>
                )}
                {project.availableUnits && (
                  <div className="key-info-item">
                    <span className="info-label">Available Units:</span>
                    <span className="info-value">{project.availableUnits}</span>
                  </div>
                )}
                {getExpectedCompletion() && (
                  <div className="key-info-item">
                    <span className="info-label">
                      {project.status === 'completed' ? 'Completed' : 'Expected Completion:'}
                    </span>
                    <span className="info-value">{getExpectedCompletion()}</span>
                  </div>
                )}
                {project.startingPrice && (
                  <div className="key-info-item">
                    <span className="info-label">Price Range:</span>
                    <span className="info-value">
                      {formatPrice(project.startingPrice)}
                      {project.maxPrice && project.maxPrice !== project.startingPrice &&
                        ` - ${formatPrice(project.maxPrice)} Cr.`
                      }
                    </span>
                  </div>
                )}
                {project.status === 'ongoing' && project.progress !== undefined && (
                  <div className="key-info-item">
                    <span className="info-label">Construction Progress:</span>
                    <span className="info-value">{project.progress}%</span>
                  </div>
                )}
                {project.unitTypes?.length > 0 && (
                  <div className="key-info-item">
                    <span className="info-label">Unit Types:</span>
                    <span className="info-value">{project.unitTypes.join(' / ')}</span>
                  </div>
                )}
              </div>
            </div>

      {/* Unit Types & Specifications */}
      {(project.unitTypes?.length > 0 || project.specifications) && (
        <section className="project-specs-section">
          <div className="container">
            <motion.div
              className="specs-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {project.specifications && (
                <div className="specifications-section">
                  <h3>Project Specifications</h3>
                  <div className="specs-grid">
                    {project.specifications.totalFloors && (
                      <div className="spec-card">
                        <div className="spec-value">{project.specifications.totalFloors}</div>
                        <div className="spec-label">Total Floors</div>
                      </div>
                    )}
                    {project.specifications.parkingSpaces && (
                      <div className="spec-card">
                        <div className="spec-value">{project.specifications.parkingSpaces}</div>
                        <div className="spec-label">Parking Spaces</div>
                      </div>
                    )}
                    {project.specifications.elevators && (
                      <div className="spec-card">
                        <div className="spec-value">{project.specifications.elevators}</div>
                        <div className="spec-label">Elevators</div>
                      </div>
                    )}
                    {project.specifications.landArea && (
                      <div className="spec-card">
                        <div className="spec-value">{project.specifications.landArea.toLocaleString()}</div>
                        <div className="spec-label">Land Area (Sq Ft)</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Amenities & Features */}
      {(project.amenities?.length > 0 || project.features?.length > 0) && (
        <section className="amenities-features-section">
          <div className="container">
            <motion.div
              className="amenities-features-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {project.amenities?.length > 0 && (
                <div className="amenities-section">
                  <h3>Amenities</h3>
                  <div className="amenities-grid">
                    {project.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-card">
                        <span className="amenity-name">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.features?.length > 0 && (
                <div className="features-section">
                  <h3>Key Features</h3>
                  <div className="features-grid">
                    {project.features.map((feature, index) => (
                      <div key={index} className="feature-card">
                        <span className="feature-name">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.specifications?.approvals?.length > 0 && (
                <div className="approvals-section">
                  <h3>Approvals & Certifications</h3>
                  <div className="approvals-grid">
                    {project.specifications.approvals.map((approval, index) => (
                      <div key={index} className="approval-card">
                        <span className="approval-name">{approval}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Project Gallery */}
      {project.images?.length > 0 && (
        <section className="project-gallery-section">
          <div className="container">
            <motion.div
              className="gallery-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="gallery-header">
                <h3>Project Gallery</h3>
                <button
                  className="view-all-btn"
                  onClick={() => openImageGallery(0)}
                >
                  View All ({project.images.length + 1})
                </button>
              </div>

              <div className="gallery-grid">
                <div className="main-image" onClick={() => openImageGallery(0)}>
                  <img
                    src={project.heroImage}
                    alt={`${project.title} - Hero`}
                    className="gallery-image"
                  />
                  <div className="image-overlay">
                    <FiImage size={24} />
                    <span>View Gallery</span>
                  </div>
                </div>

                <div className="thumbnail-grid">
                  {project.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="thumbnail-item"
                      onClick={() => openImageGallery(index + 1)}
                    >
                      <img
                        src={image.url}
                        alt={`${project.title} - Image ${index + 1}`}
                        className="thumbnail-image"
                      />
                      {index === 3 && project.images.length > 4 && (
                        <div className="more-images-count">
                          +{project.images.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
          </motion.div>
        </div>
      </section>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && (
          <motion.div
            className="image-gallery-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageGallery(false)}
          >
            <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-gallery"
                onClick={() => setShowImageGallery(false)}
              >
                <FiX size={24} />
              </button>

              <button className="gallery-nav prev" onClick={prevImage}>
                <FiChevronLeft size={24} />
              </button>

              <button className="gallery-nav next" onClick={nextImage}>
                <FiChevronRight size={24} />
              </button>

              <div className="gallery-image-container">
                <img
                  src={[project.heroImage, ...(project.images || []).map(img => img.url)].filter(Boolean)[selectedImageIndex]}
                  alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                  className="gallery-image"
                />
              </div>

              <div className="gallery-thumbnails">
                {[project.heroImage, ...(project.images || []).map(img => img.url)].filter(Boolean).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`gallery-thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brochure Download Form Modal */}
      <AnimatePresence>
        {showBrochureForm && (
          <motion.div
            className="brochure-form-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBrochureForm(false)}
          >
            <motion.div
              className="brochure-form-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="form-header">
                <h3>Get Project Brochure</h3>
                <p>Please provide your details to download the brochure</p>
                <button
                  className="close-form"
                  onClick={() => setShowBrochureForm(false)}
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleBrochureFormSubmit} className="brochure-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={brochureFormData.name}
                    onChange={(e) => setBrochureFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                    maxLength="50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={brochureFormData.email}
                    onChange={(e) => setBrochureFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobile"
                    value={brochureFormData.mobile}
                    onChange={(e) => setBrochureFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowBrochureForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-download">
                    <FiDownload size={18} />
                    Download Brochure
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </main>
  );
};

export default ProjectDetail;

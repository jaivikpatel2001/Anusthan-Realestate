import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMapPin, FiHome, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import '../styles/ProjectCard.css';

const ProjectCard = ({ project, index, inView, onClick, showViewDetails = false }) => {
  const isOngoing = project.status === 'ongoing';
  const isUpcoming = project.status === 'upcoming';
  const isCompleted = project.status === 'completed';

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1
      }
    }
  };

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
    switch (project.status) {
      case 'upcoming': return 'var(--status-upcoming)';
      case 'ongoing': return 'var(--status-ongoing)';
      case 'completed': return 'var(--status-completed)';
      default: return 'var(--text-secondary)';
    }
  };

  const getExpectedCompletion = () => {
    if (project.timeline?.expectedCompletion) {
      return new Date(project.timeline.expectedCompletion).getFullYear();
    }
    if (project.timeline?.actualCompletion) {
      return new Date(project.timeline.actualCompletion).getFullYear();
    }
    return 'TBD';
  };

  console.log("project.heroImage",project.heroImage || project.images?.[0]?.url || '/placeholder-project.jpg') 

  return (
    <motion.div
      className="project-card modern"
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 }
      }}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <div className="card-image">
        <img
          src={project.heroImage || project.images?.[0]?.url || '/placeholder-project.jpg'}
          alt={project.title}
          loading="lazy"
        />
        

        {/* Status Badge */}
        <div className="status-badge" style={{ backgroundColor: getStatusColor() }}>
          {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
        </div>

        {/* Featured Badge */}
        {project.isFeatured && (
          <div className="featured-badge">
            <FiTrendingUp size={14} />
            Featured
          </div>
        )}

        {/* Progress Circle for Ongoing Projects */}
        {isOngoing && project.progress !== undefined && (
          <div className="card-overlay">
            <motion.div
              className="progress-circle"
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
            >
              <svg className="progress-ring" width="70" height="70">
                <circle
                  className="progress-ring-bg"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                />
                <circle
                  className="progress-ring-circle"
                  stroke="var(--accent-primary)"
                  strokeWidth="3"
                  fill="transparent"
                  r="30"
                  cx="35"
                  cy="35"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 30}`,
                    strokeDashoffset: `${2 * Math.PI * 30 * (1 - (project.progress || 0) / 100)}`,
                    transition: 'stroke-dashoffset 1s ease-in-out'
                  }}
                />
              </svg>
              <span className="progress-text">{project.progress}%</span>
            </motion.div>
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="project-title">{project.title}</h3>
          <div className="project-location">
            <FiMapPin size={14} />
            <span>{project.location}</span>
          </div>
        </div>

        <p className="project-description">
          {project.shortDescription || project.description?.substring(0, 120) + '...'}
        </p>

        <div className="project-details">
          <div className="detail-row">
            <div className="detail-item">
              <FiHome size={16} />
              <div>
                <span className="detail-label">Units</span>
                <span className="detail-value">{project.totalUnits || 'N/A'}</span>
              </div>
            </div>
            <div className="detail-item">
              <FiCalendar size={16} />
              <div>
                <span className="detail-label">
                  {isCompleted ? 'Completed' : 'Expected'}
                </span>
                <span className="detail-value">{getExpectedCompletion()}</span>
              </div>
            </div>
          </div>

          <div className="price-section">
            <span className="price-label">Starting from</span>
            <span className="price-value">
              {formatPrice(project.startingPrice)}
              {project.maxPrice && project.maxPrice !== project.startingPrice &&
                ` - ${formatPrice(project.maxPrice)}`
              }
            </span>
          </div>
        </div>

        {/* Action Button */}
        {showViewDetails && (
          <div className="card-actions">
            <Link
              to={`/projects/${project._id || project.slug}`}
              className="view-details-btn"
              onClick={(e) => e.stopPropagation()}
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;

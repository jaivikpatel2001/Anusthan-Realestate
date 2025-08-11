import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaBuilding, FaLeaf, FaHandshake, FaLightbulb } from 'react-icons/fa';
import { GiAchievement } from 'react-icons/gi';
import { MdEngineering, MdArchitecture, MdOutlineDesignServices, MdTimeline } from 'react-icons/md';
import { RiTeamFill } from 'react-icons/ri';
import { BsGraphUp } from 'react-icons/bs';
import { AiOutlineTrophy, AiOutlineHome, AiOutlineRocket } from 'react-icons/ai';
import { useGetTeamMembersQuery } from '../store/api/teamMembersApi';
import { useGetMilestonesQuery } from '../store/api/milestonesApi';
import { useGetStatisticsByLocationQuery } from '../store/api/statisticsApi';
import { InlineLoading } from '../components/LoadingSpinner';
import '../styles/About.css';

const About = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const getFullImageUrl = (url) => {
    if (!url) return '';
    // If it's already a full URL (Cloudinary or other external service), return as is
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
  };
  // Fetch team members from API
  const { data: teamMembers, isLoading: teamLoading, error: teamError } = useGetTeamMembersQuery();

  // Fetch milestones from API
  const { data: milestones, isLoading: milestonesLoading, error: milestonesError } = useGetMilestonesQuery();

  // Fetch statistics for About page
  const { data: aboutStatistics, isLoading: statisticsLoading } = useGetStatisticsByLocationQuery('about');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Static fallback data for team members (in case API fails)
  const fallbackTeamMembers = [
    {
      name: "Sarah Johnson",
      position: "CEO & Founder",
      experienceYears: 15,
      image: { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
      description: "Visionary leader with extensive experience in luxury real estate development and sustainable architecture."
    },
    {
      name: "Michael Chen",
      position: "Chief Architect",
      experienceYears: 12,
      image: { url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" },
      description: "Award-winning architect specializing in innovative design and green building technologies."
    },
    {
      name: "Emily Rodriguez",
      position: "Project Director",
      experienceYears: 10,
      image: { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
      description: "Expert project manager ensuring timely delivery and exceptional quality in every development."
    },
    {
      name: "David Thompson",
      position: "Head of Engineering",
      experienceYears: 14,
      image: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" },
      description: "Structural engineering specialist with expertise in high-rise construction and smart building systems."
    }
  ];

  // Use API data if available, otherwise use fallback
  const displayTeamMembers = teamMembers && teamMembers.length > 0 ? teamMembers : fallbackTeamMembers;

  const values = [
    {
      icon: <AiOutlineTrophy className="value-icon-svg" />,
      title: "Excellence",
      description: "We strive for perfection in every project, ensuring the highest standards of quality and craftsmanship."
    },
    {
      icon: <FaLeaf className="value-icon-svg" />,
      title: "Sustainability",
      description: "Committed to eco-friendly practices and sustainable development for a better future."
    },
    {
      icon: <FaHandshake className="value-icon-svg" />,
      title: "Integrity",
      description: "Building trust through transparency, honesty, and ethical business practices."
    },
    {
      icon: <FaLightbulb className="value-icon-svg" />,
      title: "Innovation",
      description: "Embracing cutting-edge technology and creative solutions in real estate development."
    }
  ];

  // Static fallback data for milestones (in case API fails)
  const fallbackMilestones = [
    { year: "2008", heading: "Company Founded", description: "Elite Estate was established with a vision to transform real estate development." },
    { year: "2012", heading: "First Major Project", description: "Completed our first luxury residential complex, setting new industry standards." },
    { year: "2016", heading: "Sustainability Focus", description: "Launched our green building initiative, becoming a leader in sustainable development." },
    { year: "2020", heading: "Digital Innovation", description: "Integrated smart home technology and digital solutions across all projects." },
    { year: "2023", heading: "500+ Projects", description: "Reached the milestone of 500 completed projects with 98% client satisfaction." }
  ];

  // Use API data if available, otherwise use fallback
  const displayMilestones = milestones && milestones.length > 0 ? milestones : fallbackMilestones;

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">About Elite Estate</h1>
            <p className="hero-subtitle">
              Building the future of real estate with innovation, sustainability, and excellence.
            </p>
            <div className="hero-stats">
              {statisticsLoading ? (
                <InlineLoading text="Loading statistics..." size="small" />
              ) : aboutStatistics && aboutStatistics.length > 0 ? (
                aboutStatistics.slice(0, 3).map((stat, index) => (
                  <div key={stat._id || index} className="stat">
                    <span className="stat-number">{stat.displayValue || stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))
              ) : (
                // Fallback static stats
                <>
                  <div className="stat">
                    <span className="stat-number">15+</span>
                    <span className="stat-label">Years of Excellence</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Projects Completed</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">98%</span>
                    <span className="stat-label">Client Satisfaction</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <motion.div
            ref={ref}
            className="mission-vision-content"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.div className="mission" variants={itemVariants}>
              <h2>Our Mission</h2>
              <p>
                To create exceptional real estate developments that enhance communities, 
                exceed client expectations, and set new standards for quality, innovation, 
                and sustainability in the industry.
              </p>
            </motion.div>
            <motion.div className="vision" variants={itemVariants}>
              <h2>Our Vision</h2>
              <p>
                To be the leading real estate development company, recognized globally 
                for our commitment to excellence, environmental responsibility, and 
                transformative projects that shape the future of urban living.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our Core Values
          </motion.h2>
          <motion.div
            className="values-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Meet Our Leadership Team
          </motion.h2>
          {teamLoading ? (
            <InlineLoading text="Loading team members..." size="large" />
          ) : displayTeamMembers && displayTeamMembers.length > 0 ? (
            <motion.div
              className="team-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {displayTeamMembers.map((member, index) => (
                <motion.div
                  key={member._id || index}
                  className="team-card"
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                >
                  <div className="member-image">
                    <img
                      src={getFullImageUrl(member.image?.url || member.image)}
                      alt={member.image?.alt || member.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face";
                      }}
                    />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-position">{member.position}</p>
                    <p className="member-experience">
                      {member.experienceYears ? `${member.experienceYears}+ years` : member.experience}
                    </p>
                    <p className="member-bio">{member.description || member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-state">
              <RiTeamFill size={64} className="empty-icon" />
              <h3>No Team Members</h3>
              <p>Team member information will be displayed here once added.</p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our Journey
          </motion.h2>
          {milestonesLoading ? (
            <InlineLoading text="Loading company journey..." size="large" />
          ) : displayMilestones && displayMilestones.length > 0 ? (
            <div className="timeline">
              {displayMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone._id || index}
                  className="timeline-item"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="timeline-content">
                    <div className="timeline-year">{milestone.year}</div>
                    <h3 className="timeline-event">{milestone.heading || milestone.event}</h3>
                    <p className="timeline-description">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MdTimeline size={64} className="empty-icon" />
              <h3>No Company Journey</h3>
              <p>Company milestones and journey will be displayed here once added.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Build Your Dream?</h2>
            <p>
              Join hundreds of satisfied clients who have trusted Elite Estate 
              with their most important real estate investments.
            </p>
            <motion.button
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Project
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

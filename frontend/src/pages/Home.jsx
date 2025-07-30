import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import Hero from '../components/Hero';
import ProjectCard from '../components/ProjectCard';
import { useGetProjectsByStatusQuery } from '../store/api/projectsApi';
import { InlineLoading } from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import '../styles/Home.css';


const Home = () => {
  // Intersection observers for different sections
  const [upcomingRef, upcomingInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [ongoingRef, ongoingInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [completedRef, completedInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Fetch project data by status
  const { data: upcomingProjects, isLoading: upcomingLoading } = useGetProjectsByStatusQuery('upcoming');
  const { data: ongoingProjects, isLoading: ongoingLoading } = useGetProjectsByStatusQuery('ongoing');
  const { data: completedProjects, isLoading: completedLoading } = useGetProjectsByStatusQuery('completed');

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="main-content">
      <SEOHead
        title="Elite Estate - Premium Real Estate Projects"
        description="Discover premium real estate projects including upcoming, ongoing, and completed developments. Find your dream home with Elite Estate."
        keywords={['real estate', 'properties', 'homes', 'apartments', 'upcoming projects', 'ongoing projects', 'completed projects']}
      />

      <Hero />

      {/* Upcoming Projects Section */}
      <section id="upcoming" className="projects-section upcoming-section" ref={upcomingRef}>
        <div className="container">
          <motion.div
            className="section-header"
            variants={sectionVariants}
            initial="hidden"
            animate={upcomingInView ? "visible" : "hidden"}
          >
            <div className="section-icon">
              <FiTrendingUp size={32} />
            </div>
            <h2 className="section-title">
              Upcoming <span className="title-accent">Projects</span>
            </h2>
            <p className="section-subtitle">
              Get ready for our next generation of premium developments that will redefine luxury living
            </p>
          </motion.div>

          <motion.div
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            animate={upcomingInView ? "visible" : "hidden"}
          >
            {upcomingLoading ? (
              <InlineLoading text="Loading upcoming projects..." size="large" />
            ) : upcomingProjects && upcomingProjects.length > 0 ? (
              upcomingProjects.slice(0, 3).map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  inView={upcomingInView}
                  showViewDetails={true}
                />
              ))
            ) : (
              <div className="no-projects">
                <FiTrendingUp size={48} />
                <h3>Exciting Projects Coming Soon</h3>
                <p>We're working on amazing new developments. Stay tuned for updates!</p>
              </div>
            )}
          </motion.div>

          {upcomingProjects && upcomingProjects.length > 3 && (
            <motion.div
              className="section-footer"
              initial={{ opacity: 0, y: 20 }}
              animate={upcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/projects?status=upcoming" className="view-all-btn">
                View All Upcoming Projects
                <FiArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Ongoing Projects Section */}
      <section id="ongoing" className="projects-section ongoing-section" ref={ongoingRef}>
        <div className="container">
          <motion.div
            className="section-header"
            variants={sectionVariants}
            initial="hidden"
            animate={ongoingInView ? "visible" : "hidden"}
          >
            <div className="section-icon">
              <FiClock size={32} />
            </div>
            <h2 className="section-title">
              Ongoing <span className="title-accent">Projects</span>
            </h2>
            <p className="section-subtitle">
              Witness our current developments taking shape and creating tomorrow's landmarks
            </p>
          </motion.div>

          <motion.div
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            animate={ongoingInView ? "visible" : "hidden"}
          >
            {ongoingLoading ? (
              <InlineLoading text="Loading ongoing projects..." size="large" />
            ) : ongoingProjects && ongoingProjects.length > 0 ? (
              ongoingProjects.slice(0, 3).map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  inView={ongoingInView}
                  showViewDetails={true}
                />
              ))
            ) : (
              <div className="no-projects">
                <FiClock size={48} />
                <h3>No Ongoing Projects</h3>
                <p>All our current projects are either completed or in planning phase.</p>
              </div>
            )}
          </motion.div>

          {ongoingProjects && ongoingProjects.length > 3 && (
            <motion.div
              className="section-footer"
              initial={{ opacity: 0, y: 20 }}
              animate={ongoingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/projects?status=ongoing" className="view-all-btn">
                View All Ongoing Projects
                <FiArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Completed Projects Section */}
      <section id="completed" className="projects-section completed-section" ref={completedRef}>
        <div className="container">
          <motion.div
            className="section-header"
            variants={sectionVariants}
            initial="hidden"
            animate={completedInView ? "visible" : "hidden"}
          >
            <div className="section-icon">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="section-title">
              Completed <span className="title-accent">Projects</span>
            </h2>
            <p className="section-subtitle">
              Explore our portfolio of successfully delivered projects that stand as testaments to our excellence
            </p>
          </motion.div>

          <motion.div
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            animate={completedInView ? "visible" : "hidden"}
          >
            {completedLoading ? (
              <InlineLoading text="Loading completed projects..." size="large" />
            ) : completedProjects && completedProjects.length > 0 ? (
              completedProjects.slice(0, 3).map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  inView={completedInView}
                  showViewDetails={true}
                />
              ))
            ) : (
              <div className="no-projects">
                <FiCheckCircle size={48} />
                <h3>Building Excellence</h3>
                <p>Our completed projects showcase our commitment to quality and innovation.</p>
              </div>
            )}
          </motion.div>

          {completedProjects && completedProjects.length > 3 && (
            <motion.div
              className="section-footer"
              initial={{ opacity: 0, y: 20 }}
              animate={completedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/projects?status=completed" className="view-all-btn">
                View All Completed Projects
                <FiArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;

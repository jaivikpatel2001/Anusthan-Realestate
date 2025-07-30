import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ProjectCard from './ProjectCard';
import { projects } from '../data/projectsData';
import '../styles/OngoingProjects.css';

const OngoingProjects = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Filter ongoing projects
  const ongoingProjects = projects.filter(project => project.status === 'ongoing');

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
    <section id="projects" className="ongoing-projects" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          variants={titleVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <h2 className="section-title">
            Ongoing <span className="title-accent">Projects</span>
          </h2>
          <p className="section-subtitle">
            Discover our current developments that are reshaping skylines and creating tomorrow's landmarks
          </p>
        </motion.div>

        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {ongoingProjects.map((project, index) => (
            <ProjectCard 
              key={project.id}
              project={project}
              index={index}
              inView={inView}
            />
          ))}
        </motion.div>

        <motion.div
          className="section-footer"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.a
            href="#contact"
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Invest in Our Projects
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default OngoingProjects;

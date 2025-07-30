import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSettings } from '../hooks/useSettings';
import '../styles/Hero.css';

const Hero = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { companyName, companyTagline, company } = useSettings();
  
  // Dummy background images for the hero carousel
  const backgroundImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
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

  const titleVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        delay: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="home" className="hero" ref={ref}>
      {/* Background Image Carousel */}
      <div className="hero__background">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className={`hero__bg-image ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.1
            }}
            transition={{ duration: 1.5 }}
          />
        ))}
        <div className="hero__overlay"></div>
      </div>

      {/* Floating Elements */}
      <div className="hero__floating-elements">
        <motion.div
          className="floating-element floating-element--1"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-element floating-element--2"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="floating-element floating-element--3"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="container">
        <motion.div
          className="hero__content"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h1
            className="hero__title"
            variants={titleVariants}
          >
            {companyTagline || 'Discover Your'}
            <span className="hero__title-accent"> Dream Home</span>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            variants={subtitleVariants}
          >
            {company.description || 'Luxury real estate solutions with cutting-edge design and unmatched quality. Experience the future of living.'}
          </motion.p>

          <motion.div 
            className="hero__stats"
            variants={itemVariants}
          >
            <div className="stat">
              <motion.span 
                className="stat__number"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                500+
              </motion.span>
              <span className="stat__label">Properties Sold</span>
            </div>
            <div className="stat">
              <motion.span 
                className="stat__number"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.5 }}
              >
                50+
              </motion.span>
              <span className="stat__label">Ongoing Projects</span>
            </div>
            <div className="stat">
              <motion.span 
                className="stat__number"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.5 }}
              >
                15+
              </motion.span>
              <span className="stat__label">Years Experience</span>
            </div>
          </motion.div>

          <motion.div 
            className="hero__actions"
            variants={itemVariants}
          >
            <motion.a
              href="#projects"
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Projects
            </motion.a>
            <motion.a
              href="#contact"
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="hero__scroll-indicator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <motion.div
            className="scroll-arrow"
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ↓
          </motion.div>
          <span>Scroll to explore</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

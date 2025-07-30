import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import buildingAnimation from '../assets/Building _ Construction.json';
import '../styles/LottiePreloader.css';

const LottiePreloader = () => {
  return (
    <div className="lottie-preloader">
      <motion.div
        className="preloader-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="lottie-container">
          <Lottie
            animationData={buildingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 200, height: 200 }}
          />
        </div>
        
        <motion.div
          className="preloader-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="preloader-title">Elite Estate</h2>
          <p className="preloader-subtitle">Building Your Dreams</p>
          
          <motion.div
            className="loading-bar"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
          >
            <div className="loading-progress"></div>
          </motion.div>
          
          <motion.p
            className="loading-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Loading amazing properties...
          </motion.p>
        </motion.div>
      </motion.div>
      
      {/* Background Animation */}
      <div className="preloader-background">
        <motion.div
          className="bg-circle bg-circle-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="bg-circle bg-circle-2"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="bg-circle bg-circle-3"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
    </div>
  );
};

export default LottiePreloader;

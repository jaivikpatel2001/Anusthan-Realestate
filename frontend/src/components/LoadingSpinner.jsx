import { motion } from 'framer-motion';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="spinner-inner"></div>
      </motion.div>
      <motion.p
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading Elite Estate...
      </motion.p>
    </div>
  );
};

// Inline loading component for sections
export const InlineLoading = ({ text = "Loading...", size = "medium" }) => {
  return (
    <div className={`inline-loading ${size}`}>
      <motion.div
        className="inline-spinner"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <span className="inline-loading-text">{text}</span>
    </div>
  );
};

export default LoadingSpinner;

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/CursorTrail.css';

const CursorTrail = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <motion.div
          className="cursor-trail"
          animate={{
            x: mousePosition.x - 10,
            y: mousePosition.y - 10,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 28,
            mass: 0.5
          }}
        />
      )}
      {isVisible && (
        <motion.div
          className="cursor-trail cursor-trail--large"
          animate={{
            x: mousePosition.x - 20,
            y: mousePosition.y - 20,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            mass: 0.8
          }}
        />
      )}
    </>
  );
};

export default CursorTrail;

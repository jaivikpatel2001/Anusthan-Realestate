import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CursorTrail from './components/CursorTrail';
import LottiePreloader from './components/LottiePreloader';
import SettingsProvider from './components/SettingsProvider';
import BrochureDownloadModal from './components/BrochureDownloadModal';
import SEOHead from './components/SEOHead';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CompletedProjects from './pages/CompletedProjects';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import './styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Increased for Lottie animation

    return () => clearTimeout(timer);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.6
  };

  if (isLoading) {
    return <LottiePreloader />;
  }

  return (
    <Router>
      <SettingsProvider>
        <SEOHead />
        <div className="app">
          <Header />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  key="home"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Home />
                </motion.div>
              }
            />
            <Route
              path="/projects"
              element={
                <motion.div
                  key="projects"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Projects />
                </motion.div>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <motion.div
                  key="project-detail"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProjectDetail />
                </motion.div>
              }
            />
            <Route
              path="/completed"
              element={
                <motion.div
                  key="completed"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <CompletedProjects />
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  key="about"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <About />
                </motion.div>
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div
                  key="contact"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Contact />
                </motion.div>
              }
            />
            <Route
              path="/admin"
              element={
                <motion.div
                  key="admin-login"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AdminLogin />
                </motion.div>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true} redirectTo="/admin">
                  <motion.div
                    key="admin-dashboard"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AdminDashboard />
                  </motion.div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
          <Footer />
          <ScrollToTop />
          <CursorTrail />
          <BrochureDownloadModal />
        </div>
      </SettingsProvider>
    </Router>
  );
}

export default App;

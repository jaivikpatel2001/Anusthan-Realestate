import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { companyName, companyLogo, isLoading } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Completed', href: '/completed' },
    { name: 'About', href: '/about' },
    
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      className={`header ${isScrolled ? 'header--scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container">
        <div className="header__content">
          {/* Logo */}
          <motion.div
            className="header__logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" onClick={closeMenu}>
              {companyLogo?.url ? (
                <img
                  src={companyLogo.url}
                  alt={companyName}
                  className="logo__image"
                  style={{ height: '40px', width: 'auto' }}
                />
              ) : (
                <>
                  <span className="logo__text">
                    {companyName ? companyName.split(' ')[0] : 'Elite'}
                  </span>
                  <span className="logo__accent">
                    {companyName ? companyName.split(' ')[1]  : 'Estate'}
                  </span>
                </>
              )}
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="header__nav">
            <ul className="nav__list">
              {menuItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  className="nav__item"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    to={item.href}
                    className={`nav__link ${location.pathname === item.href ? 'nav__link--active' : ''}`}
                    onClick={closeMenu}
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* CTA Button */}
          <motion.div
            className="header__cta"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/contact" className="btn btn-primary">
              CONTACT US
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className={`header__menu-btn ${isMenuOpen ? 'menu-btn--open' : ''}`}
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            <span></span>
            <span></span>
            <span></span>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="header__mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="mobile-nav">
                <ul className="mobile-nav__list">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.name}
                      className="mobile-nav__item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        className={`mobile-nav__link ${location.pathname === item.href ? 'mobile-nav__link--active' : ''}`}
                        onClick={closeMenu}
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <motion.div
                  className="mobile-nav__cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link to="/contact" className="btn btn-primary" onClick={closeMenu}>
                    CONTACT US
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;

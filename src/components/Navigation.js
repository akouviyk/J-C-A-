import React from 'react';
import { motion } from 'framer-motion';
import './Navigation.css';

const Navigation = ({ currentView, onNavigate, darkMode, onToggleDarkMode, user, onAuthClick }) => {
  const navItems = [
    { label: 'HOME', path: 'home' },
    { label: 'ART SPLASH', path: 'art' },
    { label: 'DRAWINGS', path: 'drawings' },
    { label: 'MUSIC', path: 'music' },
    { label: 'WRITING', path: 'writing' },
    // ...(user ? [{ label: 'MY WORK', path: 'my-contributions' }] : []),
    ...(user ? [{ label: 'DASHBOARD', path: 'dashboard' }] : [])
  ];

  return (
    <motion.nav
      className="navigation glass-minimal"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="nav-container">
        <motion.div
          className="nav-logo elongated"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          onClick={() => onNavigate('home')}
        >
          J/C[+A]
        </motion.div>

        <div className="nav-links">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              className={`nav-link refined-text border-accent ${currentView === item.path ? 'active' : ''}`}
              onClick={() => onNavigate(item.path)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5 + index * 0.1,
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>

        <div className="nav-controls">
          {/* Dark mode toggle */}
          <motion.button
            className="theme-toggle refined-text"
            onClick={onToggleDarkMode}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀' : '◐'}
          </motion.button>

          {/* Auth button */}
          <motion.button
            className="auth-toggle refined-text"
            onClick={onAuthClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={user ? 'Account' : 'Sign In'}
          >
            {user ? '◉' : '○'}
          </motion.button>

          {/* Factory icon button */}
          <motion.button
            className="factory-toggle refined-text"
            onClick={() => onNavigate('playground')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            title="Toggle Playground"
          >
            ✦
          </motion.button>
        </div>
      </div>

      {/* Minimal architectural line */}
      <div className="nav-line" />
    </motion.nav>
  );
};

export default Navigation;

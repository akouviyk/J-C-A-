import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <motion.div
          className="footer-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h3 className="footer-title elongated">CONTACT</h3>
          <div className="footer-links refined-text">
            <a href="mailto:studio@jack.com" className="footer-link hover-minimal">
              STUDIO@J/C[+A].COM
            </a>
            <a href="tel:+420123456789" className="footer-link hover-minimal">
              +420 XXX XXX XXX
            </a>
            <p className="footer-location">
              AMERICAN PARADISE, USVI<br />
              50°05'N 14°25'E
            </p>
          </div>
        </motion.div>

        <motion.div
          className="footer-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h3 className="footer-title elongated">NAVIGATE</h3>
          <div className="footer-nav refined-text">
            <a href="/architecture" className="hover-minimal">ARCHITECTURE</a>
            <a href="/photography" className="hover-minimal">PHOTOGRAPHY</a>
            <a href="/darkroom" className="hover-minimal">DARKROOM</a>
            <a href="/studio" className="hover-minimal">STUDIO</a>
            <a href="/archive" className="hover-minimal">ARCHIVE</a>
          </div>
        </motion.div>

        <motion.div
          className="footer-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h3 className="footer-title elongated">CONNECT</h3>
          <div className="footer-social refined-text">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover-minimal">
              INSTAGRAM
            </a>
            <a href="https://behance.com" target="_blank" rel="noopener noreferrer" className="hover-minimal">
              BEHANCE
            </a>
            <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="hover-minimal">
              VIMEO
            </a>
          </div>
        </motion.div>
      </div>

      {/* Minimal divider line */}
      <div className="footer-divider" />

      <div className="footer-bottom refined-text">
        <div className="footer-credit elongated">
          AMERICAN PARADISE
        </div>
        <div className="footer-tagline">
          ARCHITECTURE — FILM — PHOTOGRAPHY
        </div>
        <div className="footer-year">
          © 2024
        </div>
      </div>

      {/* Architectural detail */}
      <svg className="footer-decoration" width="100%" height="40" viewBox="0 0 1600 40">
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="var(--gray-300)"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* Measurement marks */}
        <g stroke="var(--gray-300)" strokeWidth="0.5" opacity="0.2">
          <line x1="20%" y1="0" x2="20%" y2="15" />
          <line x1="40%" y1="0" x2="40%" y2="15" />
          <line x1="60%" y1="0" x2="60%" y2="15" />
          <line x1="80%" y1="0" x2="80%" y2="15" />
        </g>
      </svg>
    </footer>
  );
};

export default Footer;

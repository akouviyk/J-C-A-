import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = ({ onEnterPlayground }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="hero">
      {/* Art Deco inspired geometric shapes */}
      <svg className="arch-background" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="archGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e0e0" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#c0c0c0" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Art Deco sunburst rays */}
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={i}
            x1="960"
            y1="540"
            x2={960 + Math.cos((i * 30 - 90) * Math.PI / 180) * 400}
            y2={540 + Math.sin((i * 30 - 90) * Math.PI / 180) * 400}
            stroke="url(#archGradient)"
            strokeWidth="0.5"
            opacity="0.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: i * 0.1 }}
          />
        ))}

        {/* Concentric circles */}
        <motion.circle
          cx="960"
          cy="540"
          r="200"
          stroke="url(#archGradient)"
          strokeWidth="0.5"
          fill="none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        <motion.circle
          cx="960"
          cy="540"
          r="300"
          stroke="url(#archGradient)"
          strokeWidth="0.5"
          fill="none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2, delay: 0.7 }}
        />

        {/* Minimal diagram lines */}
        <motion.line
          x1="100"
          y1="540"
          x2="1820"
          y2="540"
          stroke="#c0c0c0"
          strokeWidth="0.5"
          opacity="0.1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
      </svg>

      {/* Light beams for dimensional effect */}
      <div className="light-beams">
        <div className="light-beam" style={{ left: '30%', animationDelay: '0s' }} />
        <div className="light-beam" style={{ left: '50%', animationDelay: '2s' }} />
        <div className="light-beam" style={{ left: '70%', animationDelay: '4s' }} />
      </div>

      <div className="hero-content perspective-container">
        <motion.div
          className="hero-subtitle refined-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        >
          COLLABORATIVE CREATIVE PLAYGROUND
        </motion.div>

        <motion.h1
          className="hero-title elegant-title"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        >
          J/C[+A]
        </motion.h1>

        <motion.div
          className="hero-description refined-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
          }}
        >
          <p>ART — MUSIC — ARCHITECTURE — WRITING — BEHIND THE SCENES</p>
        </motion.div>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <button
            className="cta-button glass-minimal shadow-dimension border-accent"
            onClick={onEnterPlayground}
          >
            <span className="elongated">ENTER THE FACTORY</span>
          </button>
        </motion.div>

        {/* Dimension markers */}
        <motion.div
          className="dimension-markers"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <div className="dimension-marker" style={{ top: '20%', left: '10%' }}>
            COLLABORATIVE
          </div>
          <div className="dimension-marker" style={{ top: '20%', right: '10%' }}>
            CREATIVE
          </div>
          <div className="dimension-marker" style={{ bottom: '15%', left: '50%', transform: 'translateX(-50%)' }}>
            PLAYGROUND
          </div>
        </motion.div>
      </div>

      {/* Floating art deco shapes */}
      <motion.div
        className="floating-shape layer-1"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          left: '15%',
          top: '30%',
          width: '120px',
          height: '120px',
          border: '0.5px solid var(--gray-300)',
          opacity: 0.2,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        }}
      />

      <motion.div
        className="floating-shape layer-2"
        animate={{
          y: [0, 40, 0],
          rotate: [0, -8, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          right: '20%',
          top: '40%',
          width: '100px',
          height: '100px',
          border: '0.5px solid var(--gray-300)',
          opacity: 0.15,
          clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)'
        }}
      />
    </section>
  );
};

export default Hero;

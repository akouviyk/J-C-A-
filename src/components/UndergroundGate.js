import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UndergroundGate = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [knockCount, setKnockCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [membersInside, setMembersInside] = useState(7);
  const [scanlines, setScanlines] = useState(0);

  // Valid invite codes (in production, check against Firebase)
  const validCodes = ['FACTORY-2025', 'AMERICAN PARADISE-1968', 'WARHOL-SILVER'];

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlines(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleKnock = () => {
    setKnockCount(prev => prev + 1);
    if (knockCount >= 2) {
      setShowHint(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedCode = inviteCode.trim().toUpperCase();

    if (validCodes.includes(normalizedCode)) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('underground_access', 'granted');
      // Notify parent component
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    else {
      setError('INVALID CODE — ACCESS DENIED');
      setInviteCode('');
      setTimeout(() => setError(''), 2000);
    }
  };

  if (isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="authenticated-view"
      >
        <div className="welcome-screen">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="welcome-title">ACCESS GRANTED</h1>
            <p className="welcome-subtitle">ENTERING THE FACTORY...</p>

            <motion.div
              className="loading-bar"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="underground-gate">
      {/* Scanline effect */}
      <div className="scanline" style={{ top: `${scanlines}%` }} />

      {/* Concrete texture overlay */}
      <div className="concrete-texture" />

      {/* Film grain */}
      <div className="film-grain" />

      <div className="gate-container">
        {/* Members counter - top right */}
        <motion.div
          className="members-counter"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="counter-label">INSIDE</div>
          <div className="counter-number">{membersInside}</div>
          <div className="counter-pulse" />
        </motion.div>

        {/* Main entrance */}
        <motion.div
          className="entrance-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Door knock mechanism */}
          <motion.div
            className="door-visual"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleKnock}
          >
            <div className="door-frame">
              <div className="door-panel">
                <div className="door-handle" />
                <div className="peephole">
                  <motion.div
                    className="eye"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="knock-instruction">KNOCK TO ENTER</p>
          </motion.div>

          {knockCount >= 3 && (
            <motion.div
              className="voice-response"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="voice-text">"Do you have an invitation?"</p>
            </motion.div>
          )}

          {/* Code entry form */}
          <AnimatePresence>
            {knockCount >= 3 && (
              <motion.form
                className="code-entry"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
              >
                <div className="input-group">
                  <label className="input-label">INVITATION CODE</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="code-input"
                    placeholder="XXXX-XXXX"
                    autoFocus
                  />
                  <div className="input-underline" />
                </div>

                {error && (
                  <motion.div
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <button type="submit" className="submit-button">
                  <span>ENTER</span>
                  <div className="button-glow" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Hint system */}
          {showHint && knockCount < 3 && (
            <motion.div
              className="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>Keep knocking...</p>
            </motion.div>
          )}
        </motion.div>

        {/* Underground aesthetic elements */}
        <div className="underground-elements">
          <motion.div
            className="pipe pipe-1"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="pipe pipe-2"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* Bottom info */}
        <motion.div
          className="bottom-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
        >
          <p>J/C[+A] COLLABORATIVE FACTORY</p>
          <p>EST. 2025 — AMERICAN PARADISE UNDERGROUND</p>
        </motion.div>
      </div>

      <style>{`
        .underground-gate {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', monospace;
        }

        .scanline {
          position: fixed;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(0, 255, 136, 0.1);
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
          pointer-events: none;
          z-index: 100;
        }

        .concrete-texture {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.3;
        }

        .film-grain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          animation: grainMove 0.3s steps(1) infinite;
        }

        @keyframes grainMove {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2%, 2%); }
          50% { transform: translate(2%, -2%); }
          75% { transform: translate(-2%, -2%); }
        }

        .gate-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 600px;
          padding: 2rem;
        }

        .members-counter {
          position: fixed;
          top: 2rem;
          right: 2rem;
          background: rgba(139, 0, 0, 0.2);
          border: 1px solid rgba(139, 0, 0, 0.5);
          padding: 1rem 1.5rem;
          border-radius: 4px;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .counter-label {
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.3rem;
        }

        .counter-number {
          font-size: 2rem;
          font-weight: bold;
          color: #ff6b6b;
          text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
        }

        .counter-pulse {
          width: 8px;
          height: 8px;
          background: #ff6b6b;
          border-radius: 50%;
          margin: 0.5rem auto 0;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .entrance-card {
          background: rgba(26, 26, 26, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 3rem 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .door-visual {
          cursor: pointer;
          user-select: none;
          margin-bottom: 2rem;
        }

        .door-frame {
          width: 200px;
          height: 300px;
          margin: 0 auto;
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 3px solid #3a3a3a;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 
            inset 0 2px 10px rgba(0, 0, 0, 0.5),
            0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .door-panel {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%);
          border: 2px solid #0a0a0a;
          border-radius: 4px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .door-handle {
          position: absolute;
          right: 20px;
          width: 12px;
          height: 40px;
          background: #4a4a4a;
          border-radius: 20px;
          box-shadow: 
            inset 0 2px 5px rgba(0, 0, 0, 0.5),
            0 2px 5px rgba(255, 255, 255, 0.1);
        }

        .peephole {
          width: 40px;
          height: 40px;
          background: #0a0a0a;
          border: 2px solid #3a3a3a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.8);
        }

        .eye {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #ff6b6b 0%, #8b0000 100%);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
        }

        .knock-instruction {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
        }

        .voice-response {
          text-align: center;
          margin: 2rem 0;
          padding: 1rem;
          background: rgba(139, 0, 0, 0.1);
          border-left: 3px solid #8b0000;
          border-radius: 4px;
        }

        .voice-text {
          color: #ff6b6b;
          font-style: italic;
          letter-spacing: 0.1em;
        }

        .code-entry {
          margin-top: 2rem;
        }

        .input-group {
          position: relative;
          margin-bottom: 2rem;
        }

        .input-label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }

        .code-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          padding: 0.8rem 0;
          font-size: 1.2rem;
          color: #ffffff;
          letter-spacing: 0.5em;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .code-input:focus {
          outline: none;
          border-bottom-color: #00ff88;
          box-shadow: 0 2px 10px rgba(0, 255, 136, 0.3);
        }

        .code-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.3em;
        }

        .input-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #00ff88;
          transition: width 0.3s ease;
        }

        .code-input:focus ~ .input-underline {
          width: 100%;
        }

        .error-message {
          color: #ff6b6b;
          font-size: 0.9rem;
          letter-spacing: 0.2em;
          text-align: center;
          padding: 0.8rem;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: #00ff88;
          padding: 1rem 2rem;
          font-size: 1rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
        }

        .submit-button:hover {
          border-color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          transform: translateY(-2px);
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .submit-button:hover .button-glow {
          left: 100%;
        }

        .hint {
          text-align: center;
          margin-top: 1rem;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
          font-style: italic;
        }

        .underground-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .pipe {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(74, 74, 74, 0.3), transparent);
          height: 2px;
        }

        .pipe-1 {
          top: 20%;
          left: 0;
          width: 40%;
          transform: rotate(-5deg);
        }

        .pipe-2 {
          bottom: 30%;
          right: 0;
          width: 50%;
          transform: rotate(3deg);
        }

        .bottom-info {
          margin-top: 3rem;
          text-align: center;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.3);
          line-height: 1.8;
        }

        .authenticated-view {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .welcome-screen {
          text-align: center;
          padding: 2rem;
        }

        .welcome-title {
          font-size: 3rem;
          font-weight: bold;
          letter-spacing: 0.3em;
          color: #00ff88;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }

        .welcome-subtitle {
          font-size: 1.2rem;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3rem;
        }

        .loading-bar {
          height: 2px;
          background: linear-gradient(90deg, #00ff88, #00bfff);
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        @media (max-width: 768px) {
          .members-counter {
            top: 1rem;
            right: 1rem;
            padding: 0.8rem 1rem;
          }

          .counter-number {
            font-size: 1.5rem;
          }

          .entrance-card {
            padding: 2rem 1.5rem;
          }

          .door-frame {
            width: 160px;
            height: 240px;
          }

          .welcome-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UndergroundGate;
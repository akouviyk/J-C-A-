import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Darkroom.css';

const Darkroom = () => {
  const [exposed, setExposed] = useState(false);
  const [developTime, setDevelopTime] = useState(0);

  // Simulated darkroom process
  const handleExpose = () => {
    setExposed(true);
    let time = 0;
    const interval = setInterval(() => {
      time += 1;
      setDevelopTime(time);
      if (time >= 10) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const processes = [
    {
      step: 'EXPOSE',
      time: '1/125s',
      description: 'Capturing light on silver halide crystals'
    },
    {
      step: 'DEVELOP',
      time: '8 min',
      description: 'Chemical reduction reveals the latent image'
    },
    {
      step: 'STOP',
      time: '30s',
      description: 'Halt the development process'
    },
    {
      step: 'FIX',
      time: '5 min',
      description: 'Remove unexposed silver halides'
    },
    {
      step: 'WASH',
      time: '20 min',
      description: 'Remove all chemical residue'
    },
    {
      step: 'DRY',
      time: '2 hrs',
      description: 'Hang in dust-free environment'
    }
  ];

  return (
    <section className="darkroom">
      {/* Red safelight effect */}
      <div className={`safelight ${exposed ? 'exposed' : ''}`} />

      <div className="darkroom-content">
        <motion.div
          className="darkroom-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <h1 className="darkroom-title title-font">
            <span className="underground-text" data-text="DARKROOM">DARKROOM</span>
          </h1>
          <p className="darkroom-subtitle mono-font">
            ANALOG FILM DEVELOPMENT / TRADITIONAL PROCESSES
          </p>
          <div className="safelight-indicator">
            <span className="indicator-dot" />
            <span className="indicator-text mono-font">SAFELIGHT ACTIVE</span>
          </div>
        </motion.div>

        {/* Process timeline */}
        <div className="process-timeline glass">
          <h3 className="timeline-title title-font">DEVELOPMENT PROCESS</h3>
          <div className="timeline-steps">
            {processes.map((process, index) => (
              <motion.div
                key={process.step}
                className="timeline-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="step-number title-font">
                  [{String(index + 1).padStart(2, '0')}]
                </div>
                <div className="step-content">
                  <div className="step-header">
                    <h4 className="step-name title-font">{process.step}</h4>
                    <span className="step-time mono-font">{process.time}</span>
                  </div>
                  <p className="step-description mono-font">
                    {process.description}
                  </p>
                </div>
                {index < processes.length - 1 && (
                  <div className="step-connector" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive exposure simulator */}
        <div className="exposure-simulator glass">
          <h3 className="simulator-title title-font">
            EXPOSURE SIMULATOR
          </h3>
          <p className="simulator-description mono-font">
            Experience the gradual revelation of a photograph in the darkroom
          </p>

          <div className="simulator-controls">
            <button
              className="expose-button glass title-font"
              onClick={handleExpose}
              disabled={exposed}
            >
              {exposed ? 'DEVELOPING...' : '[EXPOSE PAPER]'}
            </button>
            
            {exposed && (
              <div className="develop-timer mono-font">
                <span className="timer-label">DEVELOP TIME:</span>
                <span className="timer-value">{developTime}s</span>
              </div>
            )}
          </div>

          <div className="simulator-display">
            <AnimatePresence>
              {!exposed ? (
                <motion.div
                  className="pre-exposure"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="paper-blank">
                    <span className="paper-label mono-font">
                      UNEXPOSED PAPER
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="developing-image"
                  initial={{ opacity: 0, filter: 'brightness(0) contrast(0.5)' }}
                  animate={{ 
                    opacity: 1,
                    filter: developTime >= 10 
                      ? 'brightness(1) contrast(1.1)' 
                      : `brightness(${developTime * 0.1}) contrast(${0.5 + developTime * 0.06})`
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800"
                    alt="Developing photograph"
                    className="developed-photo"
                  />
                  <div className="development-overlay">
                    {developTime < 10 && (
                      <span className="developing-label mono-font">
                        DEVELOPING...
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chemistry info */}
        <div className="chemistry-section">
          <h3 className="chemistry-title title-font">CHEMISTRY</h3>
          <div className="chemistry-grid">
            <div className="chemical-card glass">
              <div className="chemical-icon">D-76</div>
              <h4 className="chemical-name title-font">DEVELOPER</h4>
              <p className="chemical-formula mono-font">
                Metol + Hydroquinone + Sodium Sulfite + Borax
              </p>
            </div>
            <div className="chemical-card glass">
              <div className="chemical-icon">STOP</div>
              <h4 className="chemical-name title-font">STOP BATH</h4>
              <p className="chemical-formula mono-font">
                2% Acetic Acid Solution
              </p>
            </div>
            <div className="chemical-card glass">
              <div className="chemical-icon">FIX</div>
              <h4 className="chemical-name title-font">FIXER</h4>
              <p className="chemical-formula mono-font">
                Sodium Thiosulfate + Sodium Sulfite
              </p>
            </div>
          </div>
        </div>

        {/* Equipment list */}
        <div className="equipment-section glass art-deco-border">
          <h3 className="equipment-title title-font">EQUIPMENT</h3>
          <div className="equipment-list mono-font">
            <div className="equipment-item">
              <span className="eq-bullet">▪</span>
              ENLARGER / DURST M605
            </div>
            <div className="equipment-item">
              <span className="eq-bullet">▪</span>
              DEVELOPING TRAYS / PATERSON
            </div>
            <div className="equipment-item">
              <span className="eq-bullet">▪</span>
              FILM / ILFORD HP5 PLUS 400
            </div>
            <div className="equipment-item">
              <span className="eq-bullet">▪</span>
              PAPER / ILFORD MULTIGRADE RC
            </div>
            <div className="equipment-item">
              <span className="eq-bullet">▪</span>
              TIMER / GRAYLAB MODEL 300
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Darkroom;

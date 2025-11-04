import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import UndergroundGate from './components/UndergroundGate';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ArtSplash from './components/ArtSplash';
import Playground from './components/Playground';
import Footer from './components/Footer';
import Auth from './components/Auth';
import VideoProjector from './components/VideoProjector';
import MyContributions from './components/MyContributions';
import MemberDashboard from './components/MemberDashboard';
import SecretNavigation from './components/SecretNavigation';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [projectorVideo, setProjectorVideo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for underground access
  useEffect(() => {
    const undergroundAccess = localStorage.getItem('underground_access');
    if (undergroundAccess === 'granted') {
      setIsAuthenticated(true);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Handle underground gate authentication
  const handleUndergroundAuth = (code) => {
    const validCodes = ['FACTORY-2025', 'AMERICAN PARADISE-1968', 'WARHOL-SILVER'];

    if (validCodes.includes(code.toUpperCase())) {
      localStorage.setItem('underground_access', 'granted');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // If not authenticated with underground, show gate
  if (!isAuthenticated) {
    return <UndergroundGate onAuthenticate={handleUndergroundAuth} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'playground':
        return (
          <Playground
            onClose={() => setCurrentView('home')}
            user={user}
            onAuthRequired={() => setShowAuth(true)}
          />
        );

      case 'art':
        return (
          <>
            <div className="section-divider">
              <svg width="100%" height="2" viewBox="0 0 1600 2">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--gray-300)" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
            <ArtSplash onVideoPlay={setProjectorVideo} />
          </>
        );

      case 'music':
        return (
          <>
            <div className="section-divider">
              <svg width="100%" height="2" viewBox="0 0 1600 2">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--gray-300)" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
            <section className="content-section">
              <div className="content-container">
                <h2 className="elegant-title">MUSIC</h2>
                <p className="refined-text">Music content coming soon...</p>
              </div>
            </section>
          </>
        );

      case 'drawings':
        return (
          <>
            <div className="section-divider">
              <svg width="100%" height="2" viewBox="0 0 1600 2">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--gray-300)" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
            <ArtSplash onVideoPlay={setProjectorVideo} />
          </>
        );

      case 'writing':
        return (
          <>
            <div className="section-divider">
              <svg width="100%" height="2" viewBox="0 0 1600 2">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--gray-300)" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
            <section className="content-section">
              <div className="content-container">
                <h2 className="elegant-title">WRITING</h2>
                <p className="refined-text">Writing content coming soon...</p>
              </div>
            </section>
          </>
        );

      case 'my-contributions':
        if (!user) {
          setShowAuth(true);
          setCurrentView('home');
          return null;
        }
        return (
          <MyContributions
            user={user}
            onClose={() => setCurrentView('home')}
          />
        );

      case 'dashboard':
        if (!user) {
          setShowAuth(true);
          setCurrentView('home');
          return null;
        }
        return <MemberDashboard user={user} onNavigate={setCurrentView} />;

      case 'bts':
        return (
          <>
            <div className="section-divider">
              <svg width="100%" height="2" viewBox="0 0 1600 2">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--gray-300)" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
            <section className="content-section">
              <div className="content-container">
                <h2 className="elegant-title">BEHIND THE SCENES</h2>
                <p className="refined-text">Behind the scenes content coming soon...</p>
              </div>
            </section>
          </>
        );

      default:
        return (
          <>
            <Hero onEnterPlayground={() => setCurrentView('playground')} />

            <div className="section-divider">
              <svg width="100%" height="2" viewBox="0 0 1600 2">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--gray-300)" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>

            <section className="factory-intro">
              <div className="factory-container">
                <h2 className="factory-title elegant-title">THE FACTORY</h2>
                <p className="factory-description refined-text">
                  A collaborative creative space. Add your art, music, videos, writings.
                  <br />
                  Watch the canvas evolve with each contribution.
                </p>
                <div className="factory-actions">
                  <button
                    className="factory-enter glass-minimal shadow-dimension"
                    onClick={() => setCurrentView('playground')}
                  >
                    <span className="elongated">ENTER PLAYGROUND</span>
                  </button>
                  {user && (
                    <button
                      className="factory-canvas glass-minimal shadow-dimension"
                      onClick={() => setCurrentView('my-contributions')}
                    >
                      <span className="elongated">MY CONTRIBUTIONS</span>
                    </button>
                  )}
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="App">
      {/* Underground effects */}
      <div className="film-grain-overlay" />
      <div className="safelight-overlay" />

      {currentView !== 'playground' && <div className="precision-grid" />}

      {/* Secret Navigation System */}
      <SecretNavigation />

      <Navigation
        currentView={currentView}
        onNavigate={setCurrentView}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        onAuthClick={() => setShowAuth(true)}
      />

      {renderContent()}

      {/* Process Section - Minimal & Elegant */}
      <section className="process-section">
        <div className="process-container">
          <h2 className="process-title elegant-title">
            P R O C E S S
          </h2>

          <div className="process-grid">
            <div className="process-item glass-minimal shadow-dimension">
              <div className="process-number refined-text">01</div>
              <h3 className="process-name elongated">CONCEIVE</h3>
              <p className="process-description refined-text">
                Ideas emerge from the intersection of architectural precision
                and photographic intuition. Every project begins with observation.
              </p>
            </div>

            <div className="process-item glass-minimal shadow-dimension">
              <div className="process-number refined-text">02</div>
              <h3 className="process-name elongated">CONSTRUCT</h3>
              <p className="process-description refined-text">
                Translating vision into form. Structure defines the narrative
                of space and light, whether blueprint or frame.
              </p>
            </div>

            <div className="process-item glass-minimal shadow-dimension">
              <div className="process-number refined-text">03</div>
              <h3 className="process-name elongated">CAPTURE</h3>
              <p className="process-description refined-text">
                The decisive moment where architecture meets photography.
                Analog processes preserve authentic character.
              </p>
            </div>

            <div className="process-item glass-minimal shadow-dimension">
              <div className="process-number refined-text">04</div>
              <h3 className="process-name elongated">CULTIVATE</h3>
              <p className="process-description refined-text">
                In the darkroom and studio, images develop into statements.
                Refinement is an artistic act.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statement Section - Artsy & Dimensional */}
      <section className="statement-section">
        <div className="statement-container">
          <svg className="statement-arch" viewBox="0 0 800 400">
            <path
              d="M 0 400 Q 0 200, 400 200 Q 800 200, 800 400"
              stroke="var(--gray-300)"
              strokeWidth="0.5"
              fill="none"
              opacity="0.2"
            />
          </svg>

          <blockquote className="statement-quote">
            <p className="quote-text refined-text">
              Architecture and photography share a common language:
              the manipulation of space, light, and perspective to create meaning.
              In my practice, I explore this intersection — where the built environment
              becomes a canvas and the camera an instrument of architectural inquiry.
            </p>
            <cite className="quote-author elongated">— Analog</cite>
            <div className="quote-details refined-text">
              AMERICAN PARADISE, 1968 | THE FACTORY
            </div>
          </blockquote>
        </div>
      </section>


      {currentView !== 'playground' && <Footer />}

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <Auth
            user={user}
            onClose={() => setShowAuth(false)}
          />
        )}
      </AnimatePresence>

      {/* Video Projector */}
      <AnimatePresence>
        {projectorVideo && (
          <VideoProjector
            videoUrl={projectorVideo.url}
            videoId={projectorVideo.videoId}
            onClose={() => setProjectorVideo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

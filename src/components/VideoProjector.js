import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VideoProjector.css';

const VideoProjector = ({ videoUrl, videoId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleFullscreen = () => {
    const element = document.querySelector('.projector-screen');
    if (!document.fullscreenElement) {
      element.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // FIXED: Better URL conversion for Cloudflare Stream
  const getEmbedUrl = (url) => {
    if (!url) return null;

    console.log('🔍 Processing URL:', url);
    console.log('🔍 Video ID prop:', videoId);

    // If it's already an iframe URL, use it directly
    if (url.includes('/iframe')) {
      console.log('✅ Already iframe URL:', url);
      return url;
    }

    // Extract video ID from HLS/DASH manifest URLs
    let extractedVideoId = null;
    let customerSubdomain = null;

    // Try to extract from manifest URL patterns (HLS or DASH)
    const manifestMatch = url.match(/cloudflarestream\.com\/([a-f0-9]{32})\/(manifest|iframe)/i);
    if (manifestMatch && manifestMatch[1]) {
      extractedVideoId = manifestMatch[1];
      console.log('📹 Extracted video ID from manifest:', extractedVideoId);
    }

    // Try to extract customer subdomain
    const subdomainMatch = url.match(/customer-([a-zA-Z0-9]+)\.cloudflarestream/i);
    if (subdomainMatch && subdomainMatch[1]) {
      customerSubdomain = subdomainMatch[1];
      console.log('🏢 Extracted customer subdomain:', customerSubdomain);
    }

    // Use videoId prop if extraction failed
    if (!extractedVideoId && videoId) {
      extractedVideoId = videoId;
      console.log('📹 Using videoId prop:', extractedVideoId);
    }

    // Validate video ID format (32 hex characters)
    if (extractedVideoId && !/^[a-f0-9]{32}$/i.test(extractedVideoId)) {
      console.warn('⚠️ Invalid video ID format:', extractedVideoId);
      extractedVideoId = null;
    }

    // Default customer subdomain (from your example)
    if (!customerSubdomain) {
      customerSubdomain = 'egd8wletnhjj8i2u';
      console.log('🏢 Using default customer subdomain:', customerSubdomain);
    }

    // Construct iframe URL if we have the necessary pieces
    if (extractedVideoId && customerSubdomain) {
      const iframeUrl = `https://customer-${customerSubdomain}.cloudflarestream.com/${extractedVideoId}/iframe`;
      console.log('✅ Constructed iframe URL:', iframeUrl);
      return iframeUrl;
    }

    // Last resort: if URL contains cloudflarestream, try to use it as-is
    if (url.includes('cloudflarestream.com')) {
      console.warn('⚠️ Could not convert to iframe URL, returning original:', url);
    }

    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  const handleIframeLoad = () => {
    console.log('✅ Video iframe loaded successfully');
    setIsLoading(false);
  };

  const handleIframeError = (e) => {
    console.error('❌ Video iframe failed to load:', e);
    console.error('❌ Failed URL:', embedUrl);
    setError('Video is still processing or failed to load. Please try again in a few moments.');
    setIsLoading(false);
  };

  // Debug logging
  useEffect(() => {
    console.log('=== VideoProjector Debug ===');
    console.log('videoUrl prop:', videoUrl);
    console.log('videoId prop:', videoId);
    console.log('Final embedUrl:', embedUrl);
    console.log('==========================');
  }, [videoUrl, videoId, embedUrl]);

  if (!embedUrl) {
    return (
      <motion.div
        className="video-projector"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="projector-screen">
          <div className="video-container">
            <div className="error-projector">
              <p className="refined-text" style={{ color: '#ff6b6b' }}>
                Invalid video URL
              </p>
              <p className="refined-text" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                URL: {videoUrl || 'No URL provided'}
              </p>
              <button
                className="projector-btn elongated"
                onClick={onClose}
                style={{ marginTop: '1rem' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="video-projector"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={handleMouseMove}
    >
      {/* Projector light beam effect */}
      <div className="projector-beam" />

      {/* Projector screen */}
      <div className="projector-screen">
        {/* Film grain overlay */}
        <div className="film-grain" />

        {/* Vignette effect */}
        <div className="projector-vignette" />

        {/* Video container */}
        <div className="video-container">
          {isLoading && (
            <motion.div
              className="loading-projector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="reel-spinner" />
              <p className="refined-text">LOADING REEL...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="error-projector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="refined-text" style={{ color: '#ff6b6b' }}>
                {error}
              </p>
              <p className="refined-text" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                URL: {embedUrl}
              </p>
              <button
                className="projector-btn elongated"
                onClick={onClose}
                style={{ marginTop: '1rem' }}
              >
                CLOSE
              </button>
            </motion.div>
          )}

          {!error && (
            <iframe
              src={embedUrl}
              className="projector-video"
              style={{
                border: 'none',
                width: '100%',
                height: '100%',
                display: isLoading ? 'none' : 'block'
              }}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Video Player"
            />
          )}
        </div>

        {/* Projector controls */}
        <AnimatePresence>
          {showControls && !error && (
            <motion.div
              className="projector-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <button
                className="projector-btn fullscreen-btn elongated"
                onClick={handleFullscreen}
                title="Toggle Fullscreen"
              >
                {isFullscreen ? '⊟' : '⊡'} FULLSCREEN
              </button>

              <button
                className="projector-btn close-btn elongated"
                onClick={onClose}
                title="Close Projector"
              >
                ✕ CLOSE
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner markers - projector screen frame */}
        <div className="screen-frame">
          <div className="frame-corner tl" />
          <div className="frame-corner tr" />
          <div className="frame-corner bl" />
          <div className="frame-corner br" />
        </div>
      </div>

      {/* Ambient room effect */}
      <div className="projector-ambient" />
    </motion.div>
  );
};

export default VideoProjector;
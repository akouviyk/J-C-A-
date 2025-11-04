import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllContent } from '../services/contentService';
import './ArtSplash.css';

const ArtSplash = ({ onVideoPlay }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const content = await getAllContent();

      // Create splash items with random positioning
      const splashItems = content.map(item => ({
        id: item.id,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        embedUrl: item.embedUrl,
        title: item.title || item.fileName || 'Untitled',
        year: item.year || new Date().getFullYear().toString(),
        type: item.fileType?.startsWith('video/') ? 'video' : 'image',
        mediaId: item.mediaId,
        creator: item.createdBy?.email || 'Anonymous',
        // Random positioning for splash effect
        size: 120 + Math.random() * 200,
        rotation: (Math.random() - 0.5) * 25,
        x: Math.random() * 80 + 10, // 10-90% viewport width
        y: Math.random() * 80 + 10  // 10-90% viewport height
      }));

      setItems(splashItems);
    } catch (error) {
      console.error('Error loading content:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="art-splash">
        <div className="splash-loading">
          <motion.div
            className="loading-pulse"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
          />
          <p className="refined-text">LOADING ART SPLASH</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="art-splash">
        <motion.div
          className="splash-empty"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="elegant-title">NOTHING HERE YET</h2>
          <p className="refined-text">Create something in the Factory first.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="art-splash">
      <div className="splash-canvas">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className="splash-item"
            initial={{ opacity: 0, scale: 0.3, rotate: item.rotation - 90 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: item.rotation,
              x: `${item.x}vw`,
              y: `${item.y}vh`
            }}
            transition={{
              delay: index * 0.08,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{
              scale: 1.15,
              rotate: item.rotation + 5,
              zIndex: 100,
              transition: { duration: 0.3 }
            }}
            onClick={() => {
              if (item.type === 'video') {
                onVideoPlay({ url: item.embedUrl || item.url, videoId: item.mediaId });
              } else {
                setSelectedItem(item);
              }
            }}
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
              left: 0,
              top: 0
            }}
          >
            <div className="splash-frame">
              {item.type === 'video' ? (
                <>
                  <img src={item.thumbnailUrl} alt={item.title} />
                  <div className="video-badge">▶</div>
                </>
              ) : (
                <img src={item.url} alt={item.title} />
              )}
            </div>

            <motion.div
              className="splash-label"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <span className="elongated">{item.title}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <motion.div
          className="splash-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            className="lightbox-panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close refined-text"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>
            <img src={selectedItem.url} alt={selectedItem.title} />
            <div className="lightbox-details">
              <h3 className="elongated">{selectedItem.title}</h3>
              <p className="refined-text">{selectedItem.year}</p>
              <p className="refined-text" style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                {selectedItem.creator}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default ArtSplash;

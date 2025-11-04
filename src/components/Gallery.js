import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getContentByCategory } from '../services/contentService';
import './Gallery.css';

const Gallery = ({ category: initialCategory = 'art', user, onAuthRequired, onVideoPlay }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  const categories = [
    { id: 'art', label: 'ART' },
    { id: 'drawings', label: 'DRAWINGS' },
    { id: 'music', label: 'MUSIC' },
    { id: 'writing', label: 'WRITING' },
  ];

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    loadCategoryContent();
  }, [activeCategory]);

  const loadCategoryContent = async () => {
    setLoading(true);
    try {
      const content = await getContentByCategory(activeCategory);
      
      // Format content for gallery display
      const formattedContent = content.map(item => ({
        id: item.id,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        embedUrl: item.embedUrl,
        title: item.title || item.fileName || 'Untitled',
        year: item.year || new Date().getFullYear().toString(),
        type: item.fileType?.startsWith('video/') ? 'video' : 'image',
        mediaId: item.mediaId,
        creator: item.createdBy?.email || 'Anonymous',
        shape: item.shape,
        originalSize: item.size,
        originalRotation: item.rotation
      }));

      setImages(formattedContent);
    } catch (error) {
      console.error('Error loading gallery content:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="gallery">
        {/* Category Tabs */}
        <motion.div 
          className="category-tabs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab elongated ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
        
        <div className="gallery-loading">
          <motion.div
            className="loading-line"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="refined-text" style={{ marginTop: '2rem', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
            LOADING {activeCategory.toUpperCase()}
          </p>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="gallery">
        {/* Category Tabs */}
        <motion.div 
          className="category-tabs"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab elongated ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
        
        <motion.div 
          className="gallery-header"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <h2 className="gallery-title elegant-title">
            {activeCategory.toUpperCase()}
          </h2>
          <p className="gallery-count refined-text">0 WORKS</p>
        </motion.div>
        <div className="gallery-empty">
          <motion.div
            className="empty-message glass-minimal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="elongated">NO CONTENT YET</h3>
            <p className="refined-text">
              Be the first to add {activeCategory} to the Factory.
              <br />
              Sign in and start creating!
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="gallery">
      {/* Category Tabs */}
      <motion.div 
        className="category-tabs"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab elongated ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>
      
      <motion.div 
        className="gallery-header"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <h2 className="gallery-title elegant-title">
          {activeCategory.toUpperCase()}
        </h2>
        <p className="gallery-count refined-text">
          {images.length} {images.length === 1 ? 'WORK' : 'WORKS'}
        </p>
      </motion.div>

      <div className="gallery-grid">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="gallery-item depth-card shadow-dimension"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
              delay: index * 0.15, 
              duration: 1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            onClick={() => {
              if (image.type === 'video') {
                onVideoPlay(image.url);
              } else {
                setSelectedImage(image);
              }
            }}
          >
            <div className="gallery-image-container light-dimension">
              {image.type === 'video' ? (
                <>
                  <img 
                    src={image.thumbnailUrl || image.url} 
                    alt={image.title}
                    loading="lazy"
                  />
                  <div className="video-play-overlay">
                    <div className="play-icon">▶</div>
                  </div>
                </>
              ) : (
                <img 
                  src={image.url} 
                  alt={image.title}
                  loading="lazy"
                />
              )}
              
              {/* Minimal overlay */}
              <div className="gallery-overlay glass-minimal">
                <div className="overlay-content">
                  <h3 className="image-title elongated">{image.title}</h3>
                  <p className="image-year refined-text">{image.year}</p>
                  {image.creator && (
                    <p className="image-creator refined-text" style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.6 }}>
                      by {image.creator}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Architectural corner markers */}
            <div className="corner-lines">
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Minimal lightbox */}
      {selectedImage && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            className="lightbox-content glass-minimal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="lightbox-close refined-text"
              onClick={() => setSelectedImage(null)}
            >
              CLOSE
            </button>
            <img src={selectedImage.url} alt={selectedImage.title} />
            <div className="lightbox-info">
              <h3 className="elongated">{selectedImage.title}</h3>
              <p className="refined-text">{selectedImage.year}</p>
              {selectedImage.creator && (
                <p className="refined-text" style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  Created by {selectedImage.creator}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      <style jsx>{`
        .gallery-empty {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
        }

        .empty-message {
          text-align: center;
          padding: 3rem;
          max-width: 500px;
        }

        .empty-message h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          letter-spacing: 0.3em;
        }

        .empty-message p {
          font-size: 1rem;
          line-height: 1.8;
          opacity: 0.8;
        }
      `}</style>
    </section>
  );
};

export default Gallery;

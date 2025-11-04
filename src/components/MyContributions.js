import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getContentByUser, deleteContentItem } from '../services/contentService';
import './MyContributions.css';

const MyContributions = ({ user, onClose }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadMyContributions();
  }, [user]);

  const loadMyContributions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const content = await getContentByUser(user.uid);
      setContributions(content);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteContentItem(itemId);
      setContributions(prev => prev.filter(item => item.id !== itemId));
      setDeleteConfirm(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const filteredContributions = filter === 'all' 
    ? contributions 
    : contributions.filter(item => item.type === filter);

  const stats = {
    total: contributions.length,
    photos: contributions.filter(c => c.type === 'photo').length,
    videos: contributions.filter(c => c.type === 'video').length,
    drawings: contributions.filter(c => c.type === 'drawing').length,
    music: contributions.filter(c => c.type === 'music').length,
    writing: contributions.filter(c => c.type === 'writing').length,
  };

  if (loading) {
    return (
      <div className="my-contributions loading">
        <div className="loading-container">
          <motion.div
            className="loading-line"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="refined-text loading-text">LOADING YOUR CONTRIBUTIONS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-contributions">
      <div className="film-grain-overlay" />
      <div className="precision-grid" />

      {/* Header */}
      <motion.div 
        className="contributions-header glass-minimal"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-content">
          <h1 className="elegant-title">MY CONTRIBUTIONS</h1>
          <p className="refined-text header-subtitle">
            {user.email} — {stats.total} {stats.total === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>
        <button className="close-button refined-text" onClick={onClose}>
          ✕ CLOSE
        </button>
      </motion.div>

      {/* Stats Bar */}
      <motion.div 
        className="stats-bar glass-minimal"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="stat-item">
          <span className="stat-value">{stats.photos}</span>
          <span className="stat-label refined-text">PHOTOS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.videos}</span>
          <span className="stat-label refined-text">VIDEOS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.drawings}</span>
          <span className="stat-label refined-text">DRAWINGS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.music}</span>
          <span className="stat-label refined-text">MUSIC</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.writing}</span>
          <span className="stat-label refined-text">WRITING</span>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div 
        className="filter-tabs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {['all', 'photo', 'video', 'drawing', 'music', 'writing'].map((type) => (
          <button
            key={type}
            className={`filter-tab elongated ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </motion.div>

      {/* Content Grid */}
      {filteredContributions.length === 0 ? (
        <motion.div 
          className="empty-state glass-minimal"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="empty-icon">📦</div>
          <h3 className="elongated">NO {filter.toUpperCase()} CONTRIBUTIONS YET</h3>
          <p className="refined-text">
            Start creating and adding to the Factory!
          </p>
        </motion.div>
      ) : (
        <div className="contributions-grid">
          {filteredContributions.map((item, index) => (
            <motion.div
              key={item.id}
              className="contribution-card glass-minimal shadow-dimension"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.6 }}
              onClick={() => setSelectedItem(item)}
            >
              {/* Thumbnail */}
              <div className="card-thumbnail">
                {item.fileType?.startsWith('image/') ? (
                  <img src={item.thumbnailUrl || item.url} alt={item.title} />
                ) : item.fileType?.startsWith('video/') ? (
                  <>
                    <img src={item.thumbnailUrl} alt={item.title} />
                    <div className="video-indicator">▶</div>
                  </>
                ) : (
                  <div className="placeholder-thumbnail">
                    <span className="type-icon">
                      {item.type === 'music' && '🎵'}
                      {item.type === 'writing' && '📝'}
                      {item.type === 'architecture' && '🏛️'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Info */}
              <div className="card-info">
                <h3 className="card-title elongated">{item.title}</h3>
                <div className="card-meta refined-text">
                  <span className="card-type">{item.type.toUpperCase()}</span>
                  <span className="card-date">
                    {new Date(item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="card-actions">
                <button 
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(item.id);
                  }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Corner accents */}
              <div className="card-corners">
                <div className="corner tl" />
                <div className="corner tr" />
                <div className="corner bl" />
                <div className="corner br" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="detail-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="modal-content glass-minimal"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close refined-text"
                onClick={() => setSelectedItem(null)}
              >
                ✕ CLOSE
              </button>

              <div className="modal-body">
                {selectedItem.fileType?.startsWith('image/') && (
                  <img src={selectedItem.url} alt={selectedItem.title} className="modal-image" />
                )}
                {selectedItem.fileType?.startsWith('video/') && (
                  <video src={selectedItem.url} controls className="modal-video" />
                )}
                {selectedItem.fileType?.startsWith('audio/') && (
                  <audio src={selectedItem.url} controls className="modal-audio" />
                )}

                <div className="modal-info">
                  <h2 className="elegant-title">{selectedItem.title}</h2>
                  <div className="modal-meta refined-text">
                    <div className="meta-item">
                      <span className="meta-label">TYPE:</span>
                      <span className="meta-value">{selectedItem.type.toUpperCase()}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">CATEGORY:</span>
                      <span className="meta-value">{selectedItem.category.toUpperCase()}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">UPLOADED:</span>
                      <span className="meta-value">
                        {new Date(selectedItem.createdAt?.toDate ? selectedItem.createdAt.toDate() : selectedItem.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedItem.fileName && (
                      <div className="meta-item">
                        <span className="meta-label">FILE:</span>
                        <span className="meta-value">{selectedItem.fileName}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    className="delete-button glass-minimal"
                    onClick={() => setDeleteConfirm(selectedItem.id)}
                  >
                    🗑️ DELETE THIS ITEM
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="confirm-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="confirm-content glass-minimal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="elongated">DELETE CONFIRMATION</h3>
              <p className="refined-text">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <button 
                  className="confirm-btn cancel"
                  onClick={() => setDeleteConfirm(null)}
                >
                  CANCEL
                </button>
                <button 
                  className="confirm-btn delete"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  DELETE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyContributions;

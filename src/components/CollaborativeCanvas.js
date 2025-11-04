import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresence } from '../hooks/usePresence';
import { useContributions } from '../hooks/useContributions';
import './CollaborativeCanvas.css';

const CollaborativeCanvas = ({ user, onClose }) => {
  const [selectedTool, setSelectedTool] = useState('view');
  const [uploadMode, setUploadMode] = useState(null);
  const canvasRef = useRef(null);
  
  const activeUsers = usePresence(user?.uid, user?.email);
  const { contributions, loading, addContribution } = useContributions();

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // In production, upload to Firebase Storage
    const contribution = {
      type,
      authorId: user.uid,
      author: user.email,
      fileName: file.name,
      fileSize: file.size,
    };

    await addContribution(contribution);
    setUploadMode(null);
  };

  return (
    <div className="collaborative-canvas">
      <div className="canvas-header">
        <div className="header-left">
          <h2 className="canvas-title">COLLABORATIVE CANVAS</h2>
          <div className="active-users">
            {activeUsers.map((u) => (
              <div
                key={u.id}
                className="user-indicator"
                style={{ background: u.color }}
                title={u.name}
              />
            ))}
            <span className="user-count">{activeUsers.length} online</span>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="canvas-body">
        <div className="tools-sidebar">
          <div className="tool-section">
            <div className="tool-label">TOOLS</div>
            <button
              className={`tool-btn ${selectedTool === 'view' ? 'active' : ''}`}
              onClick={() => setSelectedTool('view')}
            >
              <span>VIEW</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'draw' ? 'active' : ''}`}
              onClick={() => setSelectedTool('draw')}
            >
              <span>DRAW</span>
            </button>
            <button
              className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
              onClick={() => setSelectedTool('text')}
            >
              <span>TEXT</span>
            </button>
          </div>

          <div className="tool-section">
            <div className="tool-label">UPLOAD</div>
            <label className="upload-btn">
              <span>IMAGE</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
                hidden
              />
            </label>
            <label className="upload-btn">
              <span>VIDEO</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                hidden
              />
            </label>
            <label className="upload-btn">
              <span>AUDIO</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, 'audio')}
                hidden
              />
            </label>
          </div>
        </div>

        <div className="canvas-main" ref={canvasRef}>
          <div className="canvas-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-text">LOADING CONTRIBUTIONS...</div>
              </div>
            ) : contributions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <div className="empty-text">No contributions yet</div>
                <div className="empty-subtext">Be the first to add something</div>
              </div>
            ) : (
              contributions.map((contrib) => (
                <div key={contrib.id} className="contribution-item">
                  <div className="contrib-type">{contrib.type}</div>
                  <div className="contrib-author">{contrib.author}</div>
                  <div className="contrib-time">
                    {new Date(contrib.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeCanvas;

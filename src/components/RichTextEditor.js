import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RichTextEditor.css';

const RichTextEditor = ({ onClose, onSave, user }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFont, setSelectedFont] = useState('Playfair Display');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textAlign, setTextAlign] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  const fonts = [
    'Playfair Display',
    'Cormorant Garamond',
    'Crimson Text',
    'Libre Baskerville',
    'EB Garamond',
    'Spectral',
    'Merriweather',
    'Lora',
    'PT Serif',
    'Abril Fatface',
    'Cinzel',
    'Bodoni Moda'
  ];

  useEffect(() => {
    // Load Google Fonts dynamically
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please add a title for your writing');
      return;
    }

    if (!content.trim()) {
      alert('Please write some content');
      return;
    }

    setSaving(true);

    try {
      // Create a rich text document object
      const richTextData = {
        title: title.trim(),
        content: content.trim(),
        styling: {
          font: selectedFont,
          fontSize,
          textColor,
          bgColor,
          textAlign,
          isBold,
          isItalic,
          isUnderline
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Convert to JSON string for storage
      const jsonString = JSON.stringify(richTextData, null, 2);
      
      // Create a blob and file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], `${title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`, {
        type: 'application/json'
      });

      // Call the parent's save handler
      await onSave(file, richTextData);
      
    } catch (error) {
      console.error('Error saving writing:', error);
      alert('Failed to save writing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleEditorInput = (e) => {
    setContent(e.target.innerText);
  };

  const getPreviewStyle = () => ({
    fontFamily: selectedFont,
    fontSize: `${fontSize}px`,
    color: textColor,
    backgroundColor: bgColor,
    textAlign,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecoration: isUnderline ? 'underline' : 'none'
  });

  return (
    <motion.div
      className="richtext-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="richtext-modal glass-minimal"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="richtext-header">
          <h2 className="elongated">WRITE YOUR MASTERPIECE</h2>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Title Input */}
        <div className="richtext-title-section">
          <input
            type="text"
            className="richtext-title-input"
            placeholder="Enter a title for your writing..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Toolbar */}
        <div className="richtext-toolbar">
          {/* Font Family */}
          <div className="toolbar-group">
            <label className="toolbar-label">Font</label>
            <select
              className="toolbar-select"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
            >
              {fonts.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="toolbar-group">
            <label className="toolbar-label">Size</label>
            <input
              type="number"
              className="toolbar-input"
              value={fontSize}
              onChange={(e) => setFontSize(Math.max(8, Math.min(72, parseInt(e.target.value) || 16)))}
              min="8"
              max="72"
            />
          </div>

          {/* Text Color */}
          <div className="toolbar-group">
            <label className="toolbar-label">Text</label>
            <input
              type="color"
              className="toolbar-color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>

          {/* Background Color */}
          <div className="toolbar-group">
            <label className="toolbar-label">Background</label>
            <input
              type="color"
              className="toolbar-color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>

          {/* Text Align */}
          <div className="toolbar-group">
            <label className="toolbar-label">Align</label>
            <div className="toolbar-buttons">
              <button
                className={`toolbar-btn ${textAlign === 'left' ? 'active' : ''}`}
                onClick={() => setTextAlign('left')}
                title="Align Left"
              >
                ⬅
              </button>
              <button
                className={`toolbar-btn ${textAlign === 'center' ? 'active' : ''}`}
                onClick={() => setTextAlign('center')}
                title="Align Center"
              >
                ⬌
              </button>
              <button
                className={`toolbar-btn ${textAlign === 'right' ? 'active' : ''}`}
                onClick={() => setTextAlign('right')}
                title="Align Right"
              >
                ➡
              </button>
            </div>
          </div>

          {/* Text Style */}
          <div className="toolbar-group">
            <label className="toolbar-label">Style</label>
            <div className="toolbar-buttons">
              <button
                className={`toolbar-btn ${isBold ? 'active' : ''}`}
                onClick={() => setIsBold(!isBold)}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                className={`toolbar-btn ${isItalic ? 'active' : ''}`}
                onClick={() => setIsItalic(!isItalic)}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                className={`toolbar-btn ${isUnderline ? 'active' : ''}`}
                onClick={() => setIsUnderline(!isUnderline)}
                title="Underline"
              >
                <u>U</u>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="richtext-editor-wrapper">
          <div
            ref={editorRef}
            className="richtext-editor"
            contentEditable
            onInput={handleEditorInput}
            style={getPreviewStyle()}
            suppressContentEditableWarning
          >
            {/* Placeholder */}
            {!content && (
              <span className="editor-placeholder">
                Start writing your thoughts, stories, poems, or essays here...
              </span>
            )}
          </div>
        </div>

        {/* Character Count */}
        <div className="richtext-footer">
          <span className="character-count refined-text">
            {content.length} characters • {content.split(/\s+/).filter(w => w.length > 0).length} words
          </span>
        </div>

        {/* Action Buttons */}
        <div className="richtext-actions">
          <button
            className="richtext-btn cancel"
            onClick={onClose}
            disabled={saving}
          >
            CANCEL
          </button>
          <button
            className="richtext-btn save"
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
          >
            {saving ? 'SAVING...' : 'SAVE & PUBLISH'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RichTextEditor;

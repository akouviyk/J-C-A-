import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DrawingCanvas.css';

const DrawingCanvas = ({ onClose, onSave, user }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);

  // Preset colors
  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.75;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setContext(ctx);
    saveToHistory(canvas);
  }, []);

  const saveToHistory = (canvas) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    if (!context) return;
    setIsDrawing(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = brushSize * 3;
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = color;
      context.lineWidth = brushSize;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (context) {
      context.closePath();
      saveToHistory(canvasRef.current);
    }
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;

    const canvas = canvasRef.current;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory(canvas);
  };

  const undo = () => {
    if (historyStep <= 0) return;

    const newStep = historyStep - 1;
    setHistoryStep(newStep);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[newStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;

    const newStep = historyStep + 1;
    setHistoryStep(newStep);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[newStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;

    setIsSaving(true);

    try {
      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvasRef.current.toBlob(resolve, 'image/png');
      });

      // Create a File object from the blob
      const file = new File([blob], `drawing_${Date.now()}.png`, { type: 'image/png' });

      // Call the parent's save function with the file
      await onSave(file);

      // Close the drawing canvas
      onClose();
    } catch (error) {
      console.error('Error saving drawing:', error);
      alert('Failed to save drawing. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadDrawing = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `drawing_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <motion.div
      className="drawing-canvas-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="drawing-canvas-container">
        {/* Header */}
        <div className="drawing-header glass-minimal">
          <div className="header-left">
            <h2 className="drawing-title elongated">DRAWING CANVAS</h2>
            <span className="drawing-subtitle refined-text">
              Freehand Drawing Tool
            </span>
          </div>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="drawing-toolbar glass-minimal">
          {/* Tool Selection */}
          <div className="toolbar-section">
            <span className="section-label refined-text">TOOL</span>
            <div className="tool-buttons">
              <button
                className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
                onClick={() => setTool('pen')}
                title="Pen"
              >
                ✏️
              </button>
              <button
                className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                onClick={() => setTool('eraser')}
                title="Eraser"
              >
                🧹
              </button>
            </div>
          </div>

          {/* Brush Size */}
          <div className="toolbar-section">
            <span className="section-label refined-text">SIZE</span>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="brush-size-slider"
            />
            <span className="brush-size-display">{brushSize}px</span>
          </div>

          {/* Color Picker */}
          <div className="toolbar-section">
            <span className="section-label refined-text">COLOR</span>
            <div className="color-picker-container">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
                disabled={tool === 'eraser'}
              />
              <div className="preset-colors">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    className={`color-preset ${color === presetColor ? 'active' : ''}`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => {
                      setColor(presetColor);
                      setTool('pen');
                    }}
                    title={presetColor}
                    disabled={tool === 'eraser'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="toolbar-section">
            <span className="section-label refined-text">ACTIONS</span>
            <div className="action-buttons">
              <button
                className="action-btn"
                onClick={undo}
                disabled={historyStep <= 0}
                title="Undo"
              >
                ↶ Undo
              </button>
              <button
                className="action-btn"
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                title="Redo"
              >
                ↷ Redo
              </button>
              <button
                className="action-btn danger"
                onClick={clearCanvas}
                title="Clear Canvas"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="canvas-area">
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ cursor: tool === 'eraser' ? 'crosshair' : 'crosshair' }}
          />
        </div>

        {/* Bottom Actions */}
        <div className="drawing-actions glass-minimal">
          <button
            className="action-btn secondary"
            onClick={downloadDrawing}
            title="Download as PNG"
          >
            💾 Download
          </button>
          <div className="spacer" />
          <button
            className="action-btn cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="action-btn primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '⏳ Saving...' : '✓ Save to Playground'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DrawingCanvas;

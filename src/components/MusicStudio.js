import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Song, Track, Instrument, Effect } from 'reactronica';
import './MusicStudio.css';

const MusicStudio = ({ onClose, onSave, user }) => {
  const [activeTab, setActiveTab] = useState('choose'); // choose, compose, record, upload
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Composition state (Reactronica)
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [selectedInstrument, setSelectedInstrument] = useState('synth');
  const [notes, setNotes] = useState([
    { note: 'C4', duration: 0.5 },
    { note: 'D4', duration: 0.5 },
    { note: 'E4', duration: 0.5 },
    { note: 'F4', duration: 0.5 },
  ]);
  const [volume, setVolume] = useState(0);

  // Upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const audioRef = useRef(null);

  const tabs = [
    { id: 'choose', label: 'CHOOSE', icon: '🎵' },
    { id: 'compose', label: 'COMPOSE', icon: '🎹' },
    { id: 'record', label: 'RECORD', icon: '🎤' },
    { id: 'upload', label: 'UPLOAD', icon: '📁' },
  ];

  const instruments = [
    { id: 'synth', label: 'Synthesizer', icon: '🎹' },
    { id: 'membraneSynth', label: 'Drum', icon: '🥁' },
    { id: 'amSynth', label: 'AM Synth', icon: '🎛️' },
    { id: 'fmSynth', label: 'FM Synth', icon: '📻' },
    { id: 'duoSynth', label: 'Duo Synth', icon: '🎼' },
  ];

  const availableNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordedChunks(chunks);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const discardRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedUrl(null);
    setRecordedChunks([]);
    setRecordingTime(0);
  };

  // Upload functions
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert('Please upload an audio or video file');
      return;
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setUploadedUrl(url);

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Composition functions
  const addNote = (note) => {
    setNotes([...notes, { note, duration: 0.5 }]);
  };

  const removeNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const clearNotes = () => {
    setNotes([]);
  };

  // Save function
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please add a title for your music');
      return;
    }

    setSaving(true);

    try {
      let file;
      let musicData = {
        title: title.trim(),
        type: activeTab,
        createdAt: new Date().toISOString(),
      };

      if (activeTab === 'record' && recordedChunks.length > 0) {
        // Save recorded audio
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        file = new File([blob], `${title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`, {
          type: 'audio/webm'
        });
        musicData.duration = recordingTime;

      } else if (activeTab === 'upload' && uploadedFile) {
        // Save uploaded file
        file = uploadedFile;

        // If it's a video, we'll extract audio on the backend
        musicData.isVideo = uploadedFile.type.startsWith('video/');

      } else if (activeTab === 'compose') {
        // Save composition data
        musicData.composition = {
          tempo,
          instrument: selectedInstrument,
          notes,
          volume
        };

        // Convert composition data to JSON file
        const jsonString = JSON.stringify(musicData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        file = new File([blob], `${title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`, {
          type: 'application/json'
        });

      } else {
        alert('Please create or upload music before saving');
        setSaving(false);
        return;
      }

      // Call the parent's save handler
      await onSave(file, musicData);

    } catch (error) {
      console.error('Error saving music:', error);
      alert('Failed to save music. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="music-studio-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="music-studio-modal glass-minimal"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="music-studio-header">
          <h2 className="elongated">MUSIC STUDIO</h2>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Title Input */}
        <div className="music-title-section">
          <input
            type="text"
            className="music-title-input"
            placeholder="Name it..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Tab Navigation */}
        <div className="music-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`music-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              disabled={saving}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="music-content">
          {/* Choose Tab */}
          {activeTab === 'choose' && (
            <div className="music-choose">
              <h3>Choose Your Creative Path</h3>
              <div className="choose-grid">
                <div className="choose-card" onClick={() => setActiveTab('compose')}>
                  <span className="choose-icon">🎹</span>
                  <h4>Compose Music</h4>
                  <p>Create melodies using our interactive synthesizer</p>
                </div>
                <div className="choose-card" onClick={() => setActiveTab('record')}>
                  <span className="choose-icon">🎤</span>
                  <h4>Record Voice/Audio</h4>
                  <p>Capture your voice or any sound with your microphone</p>
                </div>
                <div className="choose-card" onClick={() => setActiveTab('upload')}>
                  <span className="choose-icon">📁</span>
                  <h4>Upload Audio/Video</h4>
                  <p>Upload audio files or extract sound from videos</p>
                </div>
              </div>
            </div>
          )}

          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <div className="music-compose">
              <div className="compose-controls">
                {/* Instrument Selection */}
                <div className="control-group">
                  <label>Instrument</label>
                  <div className="instrument-grid">
                    {instruments.map(inst => (
                      <button
                        key={inst.id}
                        className={`instrument-btn ${selectedInstrument === inst.id ? 'active' : ''}`}
                        onClick={() => setSelectedInstrument(inst.id)}
                      >
                        <span>{inst.icon}</span>
                        <span>{inst.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tempo Control */}
                <div className="control-group">
                  <label>Tempo: {tempo} BPM</label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={tempo}
                    onChange={(e) => setTempo(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                {/* Volume Control */}
                <div className="control-group">
                  <label>Volume: {Math.round((volume + 30) * 100 / 30)}%</label>
                  <input
                    type="range"
                    min="-30"
                    max="0"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>

              {/* Note Sequencer */}
              <div className="note-sequencer">
                <div className="sequencer-header">
                  <h4>Note Sequence ({notes.length} notes)</h4>
                  <div className="sequencer-actions">
                    <button onClick={clearNotes} disabled={notes.length === 0}>
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="notes-list">
                  {notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <span className="note-name">{note.note}</span>
                      <button
                        className="note-remove"
                        onClick={() => removeNote(index)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className="empty-state">
                      Add notes using the keyboard below
                    </div>
                  )}
                </div>

                {/* Piano Keys */}
                <div className="piano-keys">
                  {availableNotes.map(note => (
                    <button
                      key={note}
                      className="piano-key"
                      onClick={() => addNote(note)}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="playback-controls">
                <button
                  className="play-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={notes.length === 0}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
              </div>

              {/* Reactronica Component (Hidden) */}
              {notes.length > 0 && (
                <Song isPlaying={isPlaying} tempo={tempo}>
                  <Track
                    steps={notes.map(n => n.note)}
                    volume={volume}
                  >
                    <Instrument type={selectedInstrument} />
                  </Track>
                </Song>
              )}
            </div>
          )}

          {/* Record Tab */}
          {activeTab === 'record' && (
            <div className="music-record">
              {!recordedUrl ? (
                <div className="record-interface">
                  <div className="record-visualizer">
                    <div className={`record-indicator ${isRecording ? 'recording' : ''}`}>
                      {isRecording ? '🔴' : '🎤'}
                    </div>
                    {isRecording && (
                      <div className="recording-time">
                        {formatTime(recordingTime)}
                      </div>
                    )}
                  </div>

                  <div className="record-controls">
                    {!isRecording ? (
                      <button className="record-btn start" onClick={startRecording}>
                        <span>🎤</span>
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <>
                        <button
                          className="record-btn pause"
                          onClick={pauseRecording}
                        >
                          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                        </button>
                        <button className="record-btn stop" onClick={stopRecording}>
                          <span>⏹️</span>
                          <span>Stop</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* <div className="record-tips">
                    <p>💡 Tips for best quality:</p>
                    <ul>
                      <li>Find a quiet environment</li>
                      <li>Speak clearly and at a consistent distance from the mic</li>
                      <li>Test your microphone levels first</li>
                    </ul>
                  </div> */}
                </div>
              ) : (
                <div className="recorded-preview">
                  <div className="preview-info">
                    <h4>Recording Complete!</h4>
                    <p>Duration: {formatTime(recordingTime)}</p>
                  </div>

                  <audio
                    src={recordedUrl}
                    controls
                    className="audio-player"
                  />

                  <div className="preview-actions">
                    <button
                      className="action-btn discard"
                      onClick={discardRecording}
                    >
                      🗑️ Discard & Re-record
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="music-upload">
              {!uploadedUrl ? (
                <div className="upload-interface">
                  <div className="upload-dropzone">
                    <input
                      type="file"
                      id="music-file-input"
                      accept="audio/*,video/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="music-file-input" className="upload-label">
                      <span className="upload-icon">📁</span>
                      <h4>Upload Audio or Video</h4>
                      <p>Click to browse or drag and drop</p>
                      <span className="upload-hint">
                        Supports: MP3, WAV, M4A, OGG, MP4, MOV, AVI
                      </span>
                    </label>
                  </div>

                  <div className="upload-info">
                    <h4>What you can upload:</h4>
                    <ul>
                      <li>🎵 Audio files (MP3, WAV, etc.) - played as-is</li>
                      <li>🎬 Video files (MP4, MOV, etc.) - audio will be extracted</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="uploaded-preview">
                  <div className="preview-info">
                    <h4>File Uploaded!</h4>
                    <p>{uploadedFile.name}</p>
                    <p className="file-type">
                      {uploadedFile.type.startsWith('video/')
                        ? '🎬 Video (audio will be extracted)'
                        : '🎵 Audio file'}
                    </p>
                  </div>

                  <audio
                    ref={audioRef}
                    src={uploadedUrl}
                    controls
                    className="audio-player"
                  />

                  <div className="preview-actions">
                    <button
                      className="action-btn discard"
                      onClick={() => {
                        URL.revokeObjectURL(uploadedUrl);
                        setUploadedFile(null);
                        setUploadedUrl(null);
                      }}
                    >
                      🗑️ Remove & Upload Different
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="music-actions">
          <button
            className="music-btn cancel"
            onClick={onClose}
            disabled={saving}
          >
            CANCEL
          </button>
          <button
            className="music-btn save"
            onClick={handleSave}
            disabled={
              saving ||
              !title.trim() ||
              (activeTab === 'record' && !recordedUrl) ||
              (activeTab === 'upload' && !uploadedFile) ||
              (activeTab === 'compose' && notes.length === 0) ||
              activeTab === 'choose'
            }
          >
            {saving ? 'SAVING...' : 'SAVE & PUBLISH'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MusicStudio;

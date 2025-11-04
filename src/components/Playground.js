import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMediaFile, saveContentItem, getAllContent, deleteContentItem, checkVideoStatus, refreshVideoStatus } from '../services/contentService';
import { usePresence } from '../hooks/usePresence';
import DrawingCanvas from './DrawingCanvas';
import RichTextEditor from './RichTextEditor';
import MusicStudio from './MusicStudio';
import './Playground.css';


const getDevelopmentProgress = (createdAt) => {
  const totalDevTime = 17 * 60 * 60 * 1000; // 17 hours in ms
  const now = Date.now();
  const elapsed = now - (createdAt || now);
  const progress = Math.min(elapsed / totalDevTime, 1);
  return progress; // 0 → not developed, 1 → fully developed
};

const Playground = ({ onClose, user, onAuthRequired }) => {
  const [items, setItems] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);
  const [processingVideos, setProcessingVideos] = useState(new Set());
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [showRichTextEditor, setShowRichTextEditor] = useState(false);
  const [showMusicStudio, setShowMusicStudio] = useState(false);


  // Real-time presence
  const activeUsers = usePresence(user?.uid, user?.email || 'Anonymous');

  // Generate random creative shapes
  const shapeTypes = [
    'circle',
    'square',
    'diamond',
    'hexagon',
    'triangle',
    'arch',
    'organic-blob',
    'art-deco-fan'
  ];

  const contentTypes = [
    { id: 'photo', label: 'PHOTO', icon: '📷', accept: 'image/*' },
    { id: 'video', label: 'VIDEO', icon: '🎬', accept: 'video/*' },
    { id: 'drawing', label: 'DRAWING', icon: '✏️', accept: 'image/*' },
    { id: 'music', label: 'MUSIC', icon: '🎵', accept: 'audio/*' },
    { id: 'writing', label: 'WRITING', icon: '📝', accept: '.txt,.doc,.docx,.pdf' },
    { id: 'architecture', label: 'ARCHITECTURE', icon: '🏛️', accept: 'image/*,.pdf' }
  ];

  // Load existing content on mount
  useEffect(() => {
    loadContent();
  }, []);


  // Add this effect to poll processing videos
  useEffect(() => {
    const checkProcessingVideos = async () => {
      const items = await getAllContent();
      const processingItems = items.filter(item =>
        item.fileType?.startsWith('video/') &&
        (item.status === 'processing' || !item.readyToStream)
      );

      if (processingItems.length > 0) {
        console.log(`Found ${processingItems.length} videos still processing`);

        // Check each video
        for (const item of processingItems) {
          if (item.mediaId && !processingVideos.has(item.mediaId)) {
            setProcessingVideos(prev => new Set([...prev, item.mediaId]));
            pollVideoStatus(item.id, item.mediaId);
          }
        }
      }
    };

    // Check on mount and every 30 seconds
    checkProcessingVideos();
    const interval = setInterval(checkProcessingVideos, 30000);

    return () => clearInterval(interval);
  }, []);


  // Function to poll video status
  const pollVideoStatus = async (firestoreId, videoId) => {
    try {
      console.log(`🔄 Polling status for video ${videoId}...`);

      const maxAttempts = 60; // 5 minutes max (5 seconds * 60)
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const status = await checkVideoStatus(videoId);

          if (status.success && status.ready) {
            console.log(`✅ Video ${videoId} is ready!`);

            // Update Firebase with new status
            await refreshVideoStatus(firestoreId, videoId);

            // Remove from processing set
            setProcessingVideos(prev => {
              const next = new Set(prev);
              next.delete(videoId);
              return next;
            });

            // Reload content to show the video
            await loadContent();

            break;
          }

          if (status.status === 'error') {
            console.error(`❌ Video ${videoId} processing failed`);
            setProcessingVideos(prev => {
              const next = new Set(prev);
              next.delete(videoId);
              return next;
            });
            break;
          }

          // Wait 5 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          console.error('Error checking video status:', error);
          break;
        }
      }
    } catch (error) {
      console.error('Error in pollVideoStatus:', error);
      setProcessingVideos(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }
  };

  // Update the handleFileUpload to start polling after upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Preparing upload...');

    try {
      let fileData = {
        placeholder: false,
        name: file.name,
        type: file.type,
        size: file.size,
        bgColor: `hsl(${Math.random() * 360}, 50%, 92%)`
      };

      // Upload to Cloudflare via backend proxy (images and videos only)
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setUploadProgress(`Uploading ${file.type.startsWith('video/') ? 'video' : 'image'}...`);

        const uploadResult = await uploadMediaFile(file, selectedType);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Store URLs and metadata
        fileData.url = uploadResult.url;
        fileData.thumbnailUrl = uploadResult.thumbnailUrl;
        fileData.embedUrl = uploadResult.embedUrl;
        fileData.mediaId = uploadResult.mediaId;
        fileData.storage = uploadResult.storage;
        fileData.mediaType = uploadResult.mediaType;
        fileData.status = uploadResult.status;
        fileData.readyToStream = uploadResult.readyToStream;

        // Additional fields for images
        if (uploadResult.variants) {
          fileData.variants = uploadResult.variants;
          fileData.largeUrl = uploadResult.largeUrl;
          fileData.mediumUrl = uploadResult.mediumUrl;
          fileData.smallUrl = uploadResult.smallUrl;
        }

        // Additional fields for videos
        if (uploadResult.dashUrl) {
          fileData.dashUrl = uploadResult.dashUrl;
          fileData.duration = uploadResult.duration;
        }

      } else if (file.type.startsWith('text/') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.pdf')) {
        // Handle text files
        setUploadProgress('Processing text file...');
        const uploadResult = await uploadMediaFile(file, selectedType);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Text processing failed');
        }

        fileData.textContent = uploadResult.textContent;
        fileData.storage = 'firestore-only';
        fileData.url = null;

      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      const newItem = generateRandomItem(selectedType, fileData);

      // Save to Firebase
      setUploadProgress('Saving to database...');
      const firestoreId = await saveContentItem(newItem, user);
      newItem.firestoreId = firestoreId;
      newItem.createdBy = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email
      };

      setItems(prevItems => [...prevItems, newItem]);

      // If it's a video that's processing, start polling
      if (file.type.startsWith('video/') && fileData.status === 'processing') {
        setUploadProgress('✅ Upload complete! Video is processing...');
        setProcessingVideos(prev => new Set([...prev, fileData.mediaId]));
        pollVideoStatus(firestoreId, fileData.mediaId);
      } else {
        setUploadProgress('✅ Upload complete!');
      }

      setTimeout(() => {
        setShowAddMenu(false);
        setSelectedType(null);
        setUploading(false);
        setUploadProgress('');
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(`❌ Error: ${error.message}`);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress('');
      }, 4000);
    }

    e.target.value = '';
  };

  // Fixed loadContent mapping
  const loadContent = async () => {
    try {
      const content = await getAllContent();
      const formattedItems = content.map(item => ({
        id: item.id,
        firestoreId: item.id,
        type: item.type,
        shape: item.shape,
        size: item.size,
        createdAt: item.createdAt || Date.now(),
        rotation: item.rotation,
        x: item.position?.x || Math.random() * (window.innerWidth - item.size - 200) + 100,
        y: item.position?.y || Math.random() * (window.innerHeight - item.size - 300) + 150,
        content: {
          placeholder: item.isPlaceholder,
          name: item.fileName,
          type: item.fileType,        // ADD: Map fileType to type
          fileType: item.fileType,     // KEEP: Keep original for compatibility
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          embedUrl: item.embedUrl,     // IMPORTANT: This is the iframe URL for videos
          mediaId: item.mediaId,
          storage: item.storage,       // IMPORTANT: 'cloudflare-stream' for videos
          textContent: item.textContent,
          richTextData: item.richTextData, // IMPORTANT: Rich text styling and content
          musicData: item.musicData,   // IMPORTANT: Music composition/metadata
          text: item.title,
          bgColor: item.bgColor
        },
        createdBy: item.createdBy
      }));
      setItems(formattedItems);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };


  const renderItemContent = (item) => {
    if (item.content.placeholder) {
      return (
        <div className="item-content">
          <span className="item-icon">{getContentIcon(item.type)}</span>
          <span className="item-label refined-text">{item.content.text}</span>
        </div>
      );
    }

    // Get content type from either field
    const contentType = item.content.fileType || item.content.type || '';

    // Render video content
    if (contentType.startsWith('video/')) {
      const isCloudflareStream = item.content.storage === 'cloudflare-stream';
      const isProcessing = item.content.status === 'processing' || !item.content.readyToStream;

      // Show processing state
      if (isProcessing && isCloudflareStream) {
        return (
          <div className="item-content uploaded video-processing">
            {item.content.thumbnailUrl && (
              <img
                src={item.content.thumbnailUrl}
                alt={item.content.name}
                className="uploaded-image"
                onError={(e) => {
                  // Hide image if thumbnail fails to load
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="processing-overlay">
              <span className="item-icon">🎬</span>
              <span className="item-filename refined-text">{item.content.name}</span>
              <div className="processing-indicator">
                <div className="spinner"></div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Processing video...</span>
              </div>
            </div>
          </div>
        );
      }

      // For Cloudflare Stream videos that are ready
      if (isCloudflareStream && item.content.embedUrl) {
        return (
          <div className="item-content uploaded video-content">
            <iframe
              src={item.content.embedUrl}
              className="uploaded-video-iframe"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              title={item.content.name}
              style={{ border: 'none', width: '100%', height: '100%' }}
              onError={(e) => {
                console.error('Iframe failed to load:', item.content.embedUrl);
              }}
            />
            <span className="item-filename refined-text">{item.content.name}</span>
          </div>
        );
      }

      // Fallback for other video sources or if iframe fails
      if (item.content.url) {
        return (
          <div className="item-content uploaded">
            {item.content.thumbnailUrl ? (
              <img
                src={item.content.thumbnailUrl}
                alt={item.content.name}
                className="uploaded-image"
                onError={(e) => {
                  // Fallback if thumbnail fails
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span className="item-icon">🎬</span>
              <span className="item-filename refined-text">{item.content.name}</span>
            </div>
            <span className="item-filename refined-text">{item.content.name}</span>
          </div>
        );
      }

      // No valid video URL
      return (
        <div className="item-content uploaded">
          <span className="item-icon">{getContentIcon(item.type)}</span>
          <span className="item-filename refined-text">{item.content.name}</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Video unavailable</span>
        </div>
      );
    }

    // Render image content
    else if (contentType.startsWith('image/') && item.content.url) {
      return (
        <div className="item-content uploaded">
          <img
            src={item.content.thumbnailUrl || item.content.url}
            alt={item.content.name}
            className="uploaded-image"
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
          <span className="item-filename refined-text">{item.content.name}</span>
        </div>
      );
    }

    // Render text/writing content with rich text styling
    else if (item.content.textContent) {
      // Check if it's a rich text document
      try {
        const richTextData = item.content.richTextData || JSON.parse(item.content.textContent);
        if (richTextData.styling && richTextData.content) {
          // It's a rich text document - render with styling
          const { styling } = richTextData;
          return (
            <div className="item-content uploaded writing-content">
              <div
                className="writing-preview"
                style={{
                  fontFamily: styling.font,
                  fontSize: `${Math.min(styling.fontSize * 0.6, 14)}px`,
                  color: styling.textColor,
                  backgroundColor: styling.bgColor,
                  textAlign: styling.textAlign,
                  fontWeight: styling.isBold ? 'bold' : 'normal',
                  fontStyle: styling.isItalic ? 'italic' : 'normal',
                  textDecoration: styling.isUnderline ? 'underline' : 'none',
                  padding: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {richTextData.content.substring(0, 200)}{richTextData.content.length > 200 ? '...' : ''}
              </div>
              <span className="item-filename refined-text">{item.content.name}</span>
            </div>
          );
        }
      } catch (e) {
        // Not a rich text document or parsing failed, show default
      }

      // Default text content rendering
      return (
        <div className="item-content uploaded">
          <span className="item-icon">{getContentIcon(item.type)}</span>
          <span className="item-filename refined-text">{item.content.name}</span>
        </div>
      );
    }

    // Render music/audio content
    else if (contentType.startsWith('audio/') || (item.type === 'music' && item.content.url)) {
      return (
        <div className="item-content uploaded music-content">
          <div className="music-visualizer">
            <span className="item-icon" style={{ fontSize: '3rem' }}>🎵</span>
            {item.content.musicData?.type && (
              <span className="music-type">
                {item.content.musicData.type === 'compose' && '🎹 Composition'}
                {item.content.musicData.type === 'record' && '🎤 Recording'}
                {item.content.musicData.type === 'upload' && '📁 Track'}
              </span>
            )}
          </div>
          <audio
            src={item.content.url}
            controls
            className="audio-preview"
            style={{ width: '90%', height: '40px' }}
          />
          <span className="item-filename refined-text">{item.content.name}</span>
        </div>
      );
    }

    // Fallback for other content
    else {
      return (
        <div className="item-content uploaded">
          <span className="item-icon">{getContentIcon(item.type)}</span>
          <span className="item-filename refined-text">{item.content.name || 'Untitled'}</span>
        </div>
      );
    }
  };
  // Generate random position and shape
  const generateRandomItem = (type, fileData = null) => {
    const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const size = 180 + Math.random() * 150;
    const rotation = (Math.random() - 0.5) * 30;

    return {
      id: Date.now() + Math.random(),
      type,
      shape,
      size,
      rotation,
      x: Math.random() * (window.innerWidth - size - 200) + 100,
      // y: Math.random() * (window.innerHeight - size - 300) + 150,
      y: window.innerHeight * 0.45 + 80 + Math.sin(Math.random() * Math.PI) * 40,
      content: fileData || {
        placeholder: true,
        text: `${type.toUpperCase()}`,
        bgColor: `hsl(${Math.random() * 360}, 50%, 92%)`
      }
    };
  };

  const handleFileSelect = (type) => {
    if (!user) {
      onAuthRequired();
      setShowAddMenu(false);
      return;
    }

    // Special handling for drawing - show drawing canvas
    if (type === 'drawing') {
      setSelectedType(type);
      setShowAddMenu(false);
      setShowDrawingCanvas(true);
      return;
    }

    // Special handling for writing - show rich text editor
    if (type === 'writing') {
      setSelectedType(type);
      setShowAddMenu(false);
      setShowRichTextEditor(true);
      return;
    }

    // Special handling for music - show music studio
    if (type === 'music') {
      setSelectedType(type);
      setShowAddMenu(false);
      setShowMusicStudio(true);
      return;
    }

    setSelectedType(type);
    const acceptType = contentTypes.find(ct => ct.id === type)?.accept || '*';
    fileInputRef.current.accept = acceptType;
    fileInputRef.current.click();
  };

  const handleWritingSave = async (file, richTextData) => {
    setUploading(true);
    setUploadProgress('Saving your writing...');

    try {
      let fileData = {
        placeholder: false,
        name: richTextData.title,
        type: 'application/json',
        size: file.size,
        bgColor: `hsl(${Math.random() * 360}, 50%, 92%)`,
        textContent: JSON.stringify(richTextData),
        storage: 'firestore-only',
        richTextData: richTextData, // Store the rich text data
        url: null
      };

      const newItem = generateRandomItem('writing', fileData);

      setUploadProgress('Saving to database...');
      const firestoreId = await saveContentItem(newItem, user);
      newItem.firestoreId = firestoreId;
      newItem.createdBy = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email
      };

      setItems(prevItems => [...prevItems, newItem]);
      setUploadProgress('✅ Writing published!');

      setTimeout(() => {
        setSelectedType(null);
        setUploading(false);
        setUploadProgress('');
        setShowRichTextEditor(false);
      }, 1500);

    } catch (error) {
      console.error('Writing save error:', error);
      setUploadProgress(`❌ Error: ${error.message}`);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress('');
      }, 4000);
    }
  };

  const handleMusicSave = async (file, musicData) => {
    setUploading(true);
    setUploadProgress('Saving your music...');

    try {
      let fileData = {
        placeholder: false,
        name: musicData.title,
        type: file.type,
        size: file.size,
        bgColor: `hsl(${Math.random() * 360}, 50%, 92%)`,
        musicData: musicData, // Store the music metadata
        storage: 'firestore-only',
        url: null
      };

      // For audio/video files, upload to Cloudflare
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        setUploadProgress(`Uploading ${file.type.startsWith('video/') ? 'video' : 'audio'}...`);

        const uploadResult = await uploadMediaFile(file, 'music');

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        fileData.url = uploadResult.url;
        fileData.thumbnailUrl = uploadResult.thumbnailUrl;
        fileData.embedUrl = uploadResult.embedUrl;
        fileData.mediaId = uploadResult.mediaId;
        fileData.storage = uploadResult.storage;
        fileData.mediaType = uploadResult.mediaType;

        if (uploadResult.duration) {
          fileData.duration = uploadResult.duration;
        }
      }
      // For compositions (JSON files), store in Firestore only
      else if (file.type === 'application/json') {
        fileData.textContent = await file.text();
        fileData.storage = 'firestore-only';
      }

      const newItem = generateRandomItem('music', fileData);

      setUploadProgress('Saving to database...');
      const firestoreId = await saveContentItem(newItem, user);
      newItem.firestoreId = firestoreId;
      newItem.createdBy = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email
      };

      setItems(prevItems => [...prevItems, newItem]);
      setUploadProgress('✅ Music saved!');

      setTimeout(() => {
        setSelectedType(null);
        setUploading(false);
        setUploadProgress('');
        setShowMusicStudio(false);
      }, 1500);

    } catch (error) {
      console.error('Music save error:', error);
      setUploadProgress(`❌ Error: ${error.message}`);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress('');
      }, 4000);
    }
  };

  const handleDrawingSave = async (file) => {
    setUploading(true);
    setUploadProgress('Uploading drawing...');

    try {
      // Upload the drawing as an image
      const uploadResult = await uploadMediaFile(file, 'drawing');

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      let fileData = {
        placeholder: false,
        name: file.name,
        type: file.type,
        size: file.size,
        bgColor: `hsl(${Math.random() * 360}, 50%, 92%)`,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        mediaId: uploadResult.mediaId,
        storage: uploadResult.storage,
        mediaType: uploadResult.mediaType,
      };

      if (uploadResult.variants) {
        fileData.variants = uploadResult.variants;
        fileData.largeUrl = uploadResult.largeUrl;
        fileData.mediumUrl = uploadResult.mediumUrl;
        fileData.smallUrl = uploadResult.smallUrl;
      }

      const newItem = generateRandomItem('drawing', fileData);

      setUploadProgress('Saving to database...');
      const firestoreId = await saveContentItem(newItem, user);
      newItem.firestoreId = firestoreId;
      newItem.createdBy = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email
      };

      setItems(prevItems => [...prevItems, newItem]);
      setUploadProgress('✅ Drawing saved!');

      setTimeout(() => {
        setSelectedType(null);
        setUploading(false);
        setUploadProgress('');
      }, 1500);

    } catch (error) {
      console.error('Drawing save error:', error);
      setUploadProgress(`❌ Error: ${error.message}`);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress('');
      }, 4000);
    }
  };



  const addPlaceholderItem = async (type) => {
    if (!user) {
      onAuthRequired();
      setShowAddMenu(false);
      return;
    }

    try {
      const newItem = generateRandomItem(type);

      // Save to Firebase
      const firestoreId = await saveContentItem(newItem, user);
      newItem.firestoreId = firestoreId;
      newItem.createdBy = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email
      };

      setItems(prevItems => [...prevItems, newItem]);
      setShowAddMenu(false);
    } catch (error) {
      console.error('Error adding placeholder:', error);
      alert(`Failed to add placeholder: ${error.message}`);
    }
  };

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();

    // Check if user owns this item
    if (item.createdBy?.uid !== user?.uid) {
      alert('You can only delete your own contributions.');
      return;
    }

    setDeleteConfirm(item);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      // Remove from Firebase
      if (deleteConfirm.firestoreId) {
        await deleteContentItem(deleteConfirm.firestoreId);
      }
      // Remove from local state
      setItems(prevItems => prevItems.filter(item => item.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleDragEnd = (event, info, itemId) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            x: item.x + info.offset.x,
            y: item.y + info.offset.y
          };
        }
        return item;
      })
    );
  };

  const getShapeClipPath = (shape) => {
    const paths = {
      circle: 'circle(50%)',
      square: 'inset(0)',
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      hexagon: 'polygon(50% 0%, 90% 25%, 90% 75%, 50% 100%, 10% 75%, 10% 25%)',
      triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      arch: 'polygon(0% 100%, 0% 40%, 20% 15%, 40% 5%, 60% 5%, 80% 15%, 100% 40%, 100% 100%)',
      'organic-blob': 'polygon(40% 0%, 70% 10%, 90% 30%, 100% 60%, 90% 90%, 60% 100%, 30% 90%, 0% 60%, 10% 30%)',
      'art-deco-fan': 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)'
    };
    return paths[shape] || paths.square;
  };

  const getContentIcon = (type) => {
    const found = contentTypes.find(ct => ct.id === type);
    return found ? found.icon : '📦';
  };


  return (
    <div className="playground">
      {/* Ultra minimal line */}
      {/* <svg
        className="developing-string"
        width="100%"
        height="220"
        viewBox="0 0 1000 220"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: '40%',
          left: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <path
          d="M 0 110 Q 250 90, 500 110 T 1000 110"
          stroke="rgba(185, 148, 112, 0.25)"
          strokeWidth="2.5"
          fill="none"
        />
      </svg> */}
      {/* Background grid */}
      <div className="playground-grid" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Art Deco corner ornaments */}
      <div className="corner-ornaments">
        <svg className="ornament top-left" width="100" height="100">
          <path d="M 0 100 L 0 20 Q 0 0, 20 0 L 100 0" stroke="var(--gray-300)" strokeWidth="0.5" fill="none" opacity="0.3" />
        </svg>
        <svg className="ornament top-right" width="100" height="100">
          <path d="M 100 100 L 100 20 Q 100 0, 80 0 L 0 0" stroke="var(--gray-300)" strokeWidth="0.5" fill="none" opacity="0.3" />
        </svg>
        <svg className="ornament bottom-left" width="100" height="100">
          <path d="M 0 0 L 0 80 Q 0 100, 20 100 L 100 100" stroke="var(--gray-300)" strokeWidth="0.5" fill="none" opacity="0.3" />
        </svg>
        <svg className="ornament bottom-right" width="100" height="100">
          <path d="M 100 0 L 100 80 Q 100 100, 80 100 L 0 100" stroke="var(--gray-300)" strokeWidth="0.5" fill="none" opacity="0.3" />
        </svg>
      </div>

      {/* Playground header */}
      <motion.div
        className="playground-header glass-minimal"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-left">
          <div className="playground-title elongated">THE FACTORY</div>
          <div className="playground-subtitle refined-text">
            Collaborative Creative Playground – {items.length} Items
          </div>
        </div>

        {/* Active users indicator */}
        {activeUsers.length > 0 && (
          <div className="active-users">
            <div className="users-label refined-text">ACTIVE NOW:</div>
            <div className="users-list">
              {activeUsers.slice(0, 5).map((activeUser) => (
                <div
                  key={activeUser.id}
                  className="user-indicator"
                  style={{ background: activeUser.color }}
                  title={activeUser.name}
                >
                  {activeUser.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 5 && (
                <div className="user-indicator extra" title={`+${activeUsers.length - 5} more`}>
                  +{activeUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        <button className="close-playground" onClick={onClose} title="Close Playground">
          ✕
        </button>
      </motion.div>

      {/* Upload progress indicator */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            className="upload-indicator glass-minimal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="upload-spinner" />
            <span className="refined-text">{uploadProgress}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add content button */}
      <motion.button
        className="add-button glass-minimal shadow-dimension"
        onClick={() => setShowAddMenu(!showAddMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        disabled={uploading}
      >
        <span className="add-icon">{showAddMenu ? '✕' : '+'}</span>
        <span className="add-label elongated">ADD</span>
      </motion.button>

      {/* Add content menu */}
      <AnimatePresence>
        {showAddMenu && !uploading && (
          <motion.div
            className="add-menu glass-minimal"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="menu-title refined-text">SELECT CONTENT TYPE</div>
            <div className="menu-grid">
              {contentTypes.map((type) => (
                <div key={type.id} className="menu-item-wrapper">
                  <motion.button
                    className="menu-item"
                    onClick={() => handleFileSelect(type.id)}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="menu-icon">{type.icon}</span>
                    <span className="menu-label elongated">{type.label}</span>
                    <span className="upload-hint">{type.id === 'drawing' ? 'Draw Canvas' : type.id === 'writing' ? 'Rich Text Editor' : 'Upload File'}</span>
                  </motion.button>
                  <button
                    className="placeholder-btn"
                    onClick={() => addPlaceholderItem(type.id)}
                    title="Add placeholder"
                  >
                    + Placeholder
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playground items */}
      <AnimatePresence>
        {items.map((item) => {
          const devProgress = getDevelopmentProgress(item.createdAt);
          const isFullyDeveloped = devProgress >= 1;
          const filterValue = `
  invert(${1 - devProgress})
  grayscale(${1 - devProgress})
  brightness(${0.5 + 0.5 * devProgress})
`;
          const opacityValue = 0.3 + 0.7 * devProgress;



          return <motion.div
            key={item.id}
            className="playground-item"
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              width: item.size,
              height: item.size,
              // backgroundColor: 'red',
              marginTop: 180
            }}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{
              scale: 1,
              rotate: item.rotation,
              opacity: 1
            }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            drag
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={(event, info) => handleDragEnd(event, info, item.id)}
            whileHover={{ scale: 1.05, zIndex: 1000 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Hanging line */}
            <svg
              width="2"
              height="80"
              style={{
                position: 'absolute',
                top: '-80px',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            >
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="80"
                stroke="#e0dad6"
                strokeWidth="1.5"
                opacity="0.8"
              />
            </svg>

            <motion.div
              className="item-shape glass-minimal shadow-dimension"
              style={{
                clipPath: getShapeClipPath(item.shape),
                background: item.content.bgColor,
                filter: filterValue,
                opacity: opacityValue
              }}
              animate={isFullyDeveloped ? { opacity: 1, filter: 'invert(0) grayscale(0) brightness(1)' } : {}}
              transition={{
                duration: isFullyDeveloped ? 2 : 1,
                ease: "easeInOut"
              }}
            >
              {renderItemContent(item)}

              {/* Remove button - only show for own items */}
              {user && item.createdBy?.uid === user.uid && (
                <button
                  className="item-remove"
                  onClick={(e) => handleDeleteClick(e, item)}
                  title="Delete (your item)"
                >
                  🗑️
                </button>
              )}

              {/* Show creator indicator for others' items */}
              {user && item.createdBy?.uid !== user.uid && (
                <div className="item-creator-badge" title={`Created by ${item.createdBy?.email || 'Anonymous'}`}>
                  {item.createdBy?.email?.charAt(0).toUpperCase() || '?'}
                </div>
              )}

              {/* Art Deco corner accents */}
              <div className="item-corners">
                <div className="item-corner tl" />
                <div className="item-corner tr" />
                <div className="item-corner bl" />
                <div className="item-corner br" />
              </div>
            </motion.div>

          </motion.div>
        })}
      </AnimatePresence>

      {/* Instructions */}
      {items.length === 0 && (
        <motion.div
          className="playground-instructions"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="instructions-content glass-minimal">
            <h3 className="elongated">WELCOME TO THE FACTORY</h3>
            <p className="refined-text">
              Click the <strong>+</strong> button to upload photos, videos, drawings, music, and more.
              <br />
              Or add placeholders to sketch out your composition.
              <br />
              Drag items around to create your masterpiece.
              <br />
              This is a collaborative space – everyone can contribute.
            </p>
          </div>
        </motion.div>
      )}

      {/* Drawing Canvas Modal */}
      <AnimatePresence>
        {showDrawingCanvas && (
          <DrawingCanvas
            onClose={() => setShowDrawingCanvas(false)}
            onSave={handleDrawingSave}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* Rich Text Editor Modal */}
      <AnimatePresence>
        {showRichTextEditor && (
          <RichTextEditor
            onClose={() => setShowRichTextEditor(false)}
            onSave={handleWritingSave}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* Music Studio Modal */}
      <AnimatePresence>
        {showMusicStudio && (
          <MusicStudio
            onClose={() => setShowMusicStudio(false)}
            onSave={handleMusicSave}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="delete-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="delete-modal glass-minimal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="elongated">DELETE CONFIRMATION</h3>
              <p className="refined-text">
                Are you sure you want to delete &quot;{deleteConfirm.content.name || deleteConfirm.content.text}&quot;?
                <br />
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setDeleteConfirm(null)}
                >
                  CANCEL
                </button>
                <button
                  className="modal-btn delete"
                  onClick={confirmDelete}
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

export default Playground;


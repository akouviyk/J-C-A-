import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// Firebase collection name - all content goes here
const COLLECTION_NAME = 'americanparadisevault';

// Backend API endpoints - read from environment variable
const UPLOAD_API_ENDPOINT = process.env.REACT_APP_UPLOAD_API_ENDPOINT ||
  'https://uploadmedia-xukr6zzcuq-uc.a.run.app';
const VIDEO_UPLOAD_URL_ENDPOINT = process.env.REACT_APP_VIDEO_UPLOAD_URL_ENDPOINT ||
  'https://getvideouploadurl-xukr6zzcuq-uc.a.run.app';
const VIDEO_STATUS_ENDPOINT = process.env.REACT_APP_VIDEO_STATUS_ENDPOINT ||
  'https://checkvideostatus-xukr6zzcuq-uc.a.run.app';

/**
 * Map content type to category for organization
 */
const getCategoryFromType = (type) => {
  const mapping = {
    'photo': 'images',
    'drawing': 'images',
    'video': 'videos',
    'music': 'audio',
    'writing': 'documents',
    'architecture': 'images'
  };
  return mapping[type] || 'files';
};

/**
 * Check if a URL is a base64 data URL
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
const isBase64Url = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('data:') || url.includes('base64');
};

/**
 * Upload media file to Cloudflare via secure backend proxy
 * This is the ONLY upload method - NO fallbacks to base64 or Firebase Storage
 * 
 * @param {File} file - The file to upload
 * @param {string} contentType - The content type (photo, video, etc.)
 * @returns {Promise<Object>} - Upload result with URLs and metadata
 */
export const uploadMediaFile = async (file, contentType) => {
  try {
    console.log('📤 Starting upload for:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      // Handle text files separately (no upload needed)
      if (
        file.type.startsWith('text/') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.pdf')
      ) {
        console.log('📄 Processing text file...');
        const reader = new FileReader();
        const text = await new Promise((resolve, reject) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        return {
          success: true,
          url: null,
          textContent: text,
          mediaType: 'text',
          storage: 'firestore-only',
        };
      }

      throw new Error(`Unsupported file type: ${file.type}. Only images and videos are supported.`);
    }

    // Get Firebase auth token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to upload files');
    }

    const idToken = await currentUser.getIdToken();

    // For videos, use direct upload to bypass Cloud Run size limits
    if (file.type.startsWith('video/')) {
      console.log('🎥 Using direct upload for video...');
      return await uploadVideoDirectly(file, contentType, idToken);
    }

    // For images, use the proxy endpoint (images are usually smaller)
    console.log('🖼️ Uploading image via proxy...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      category: contentType,
      type: 'image',
      collection: 'americanparadisevault',
      fileName: file.name
    }));

    const response = await fetch(UPLOAD_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log('✅ Image upload successful');
    return result;

  } catch (error) {
    console.error('❌ Media upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload video directly to Cloudflare Stream
 * Bypasses Cloud Run 32MB limit by uploading directly from client
 */
/**
 * Upload video directly to Cloudflare Stream
 * Bypasses Cloud Run 32MB limit by uploading directly from client
 */
/**
 * Upload video directly to Cloudflare Stream
 * Bypasses Cloud Run 32MB limit by uploading directly from client
 */
async function uploadVideoDirectly(file, contentType, idToken) {
  try {
    // Step 1: Get direct upload URL from our backend
    console.log('📡 Requesting direct upload URL...');
    const urlResponse = await fetch(VIDEO_UPLOAD_URL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size
      })
    });

    if (!urlResponse.ok) {
      const error = await urlResponse.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get upload URL');
    }

    const { uploadUrl, videoId, accountId, customerSubdomain } = await urlResponse.json();
    console.log('✅ Got upload URL, videoId:', videoId);
    console.log('📋 Account ID:', accountId);
    console.log('🏢 Customer Subdomain:', customerSubdomain);

    // Step 2: Upload directly to Cloudflare
    console.log('📤 Uploading video directly to Cloudflare...');
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadFormData
    });

    console.log('Upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Direct upload failed with status ${uploadResponse.status}`);
    }

    // Cloudflare direct upload returns 200 OK with empty or minimal response
    // The video is now processing on Cloudflare's side
    console.log('✅ Video uploaded successfully to Cloudflare Stream');

    // Use customer subdomain from backend, with fallback
    const finalCustomerSubdomain = customerSubdomain || 'egd8wletnhjj8i2u';
    console.log('🏢 Using customer subdomain:', finalCustomerSubdomain);

    // Return formatted result with CORRECT URLs
    const result = {
      success: true,
      videoId: videoId,
      mediaId: videoId,
      // Use the iframe embed URL for immediate playback
      url: `https://customer-${customerSubdomain}.cloudflarestream.com/${videoId}/iframe`,
      embedUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${videoId}/iframe`,
      playbackUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg?time=1s`,
      dashUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${videoId}/manifest/video.mpd`,
      status: 'processing',
      readyToStream: false, // Video is processing
      storage: 'cloudflare-stream',
      mediaType: 'video'
    };

    console.log('📹 Video URLs generated:', {
      embedUrl: result.embedUrl,
      playbackUrl: result.playbackUrl
    });

    return result;

  } catch (error) {
    console.error('❌ Direct video upload error:', error);
    throw error;
  }
}

/**
 * Save a content item to Firebase
 * All items are saved to the 'americanparadisevault' collection
 * IMPORTANT: Only saves URLs, never base64 data
 * 
 * @param {Object} item - The content item to save
 * @param {Object} user - The authenticated user
 * @returns {Promise<string>} - The document ID
 */
export const saveContentItem = async (item, user) => {
  try {
    // Validate and sanitize URLs - reject base64 data
    let url = item.content.url;
    let thumbnailUrl = item.content.thumbnailUrl;

    if (url && isBase64Url(url)) {
      console.warn('⚠️ Rejecting base64 URL - only external URLs are allowed');
      url = null;
    }

    if (thumbnailUrl && isBase64Url(thumbnailUrl)) {
      console.warn('⚠️ Rejecting base64 thumbnailUrl - only external URLs are allowed');
      thumbnailUrl = null;
    }

    // Skip saving if there's no valid URL and no text content
    if (!url && !item.content.textContent && !item.content.placeholder) {
      throw new Error('Cannot save item without valid URL or text content');
    }

    const contentData = {
      // Content type and category
      type: item.type, // photo, video, drawing, music, writing, architecture
      category: getCategoryFromType(item.type),
      title: item.content.name || `${item.type.toUpperCase()} ${Date.now()}`,

      // Cloudflare media URLs and IDs (never base64)
      mediaId: item.content.mediaId || null,
      storage: item.content.storage || 'placeholder',
      url: url,
      thumbnailUrl: thumbnailUrl,
      embedUrl: item.content.embedUrl || null,

      // Additional media variants (for images)
      variants: item.content.variants || null,
      largeUrl: item.content.largeUrl || null,
      mediumUrl: item.content.mediumUrl || null,
      smallUrl: item.content.smallUrl || null,

      // Video-specific data
      dashUrl: item.content.dashUrl || null,
      duration: item.content.duration || null,
      status: item.content.status || 'active',
      readyToStream: item.content.readyToStream || false,

      // Text content (for text files only)
      textContent: item.content.textContent || null,
      richTextData: item.content.richTextData || null,
      musicData: item.content.musicData || null,

      // Visual properties for Playground recreation
      shape: item.shape,
      size: item.size,
      rotation: item.rotation,
      position: {
        x: item.x,
        y: item.y
      },
      bgColor: item.content.bgColor,

      // Metadata
      fileName: item.content.name,
      fileType: item.content.type,
      fileSize: item.content.size || null,
      isPlaceholder: item.content.placeholder || false,
      metadata: item.content.metadata || {},

      // User info
      createdBy: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email
      },

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      // Organization
      collection: 'americanparadisevault',
      year: new Date().getFullYear().toString(),

      // Status
      active: true,
      visibility: 'public' // public, private, unlisted
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), contentData);
    console.log('✅ Content saved to americanparadisevault:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving content:', error);
    throw error;
  }
};

/**
 * Get all active content items from americanparadisevault
 * @returns {Promise<Array>} - Array of content items
 */
export const getAllContent = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTION_NAME),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      )
    );

    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📦 Loaded ${items.length} items from americanparadisevault`);

    // Log video items for debugging
    const videoItems = items.filter(item => item.fileType?.startsWith('video/'));
    if (videoItems.length > 0) {
      console.log(`🎬 Found ${videoItems.length} video(s):`, videoItems.map(v => ({
        id: v.id,
        status: v.status,
        readyToStream: v.readyToStream,
        embedUrl: v.embedUrl
      })));
    }

    return items;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

/**
 * Get content items by category
 */
export const getContentByCategory = async (category) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      )
    );

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching content by category:', error);
    throw error;
  }
};

/**
 * Get content items by user
 */
export const getContentByUser = async (userId) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTION_NAME),
        where('createdBy.uid', '==', userId),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      )
    );

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching content by user:', error);
    throw error;
  }
};

/**
 * Get content items by type
 */
export const getContentByType = async (type) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTION_NAME),
        where('type', '==', type),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      )
    );

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching content by type:', error);
    throw error;
  }
};

/**
 * Delete a content item (soft delete - sets active to false)
 */
export const deleteContentItem = async (itemId) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, itemId), {
      active: false,
      deletedAt: serverTimestamp()
    });
    console.log('🗑️ Content soft-deleted:', itemId);
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

/**
 * Permanently delete a content item
 */
export const permanentlyDeleteContentItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, itemId));
    console.log('💀 Content permanently deleted:', itemId);
  } catch (error) {
    console.error('Error permanently deleting content:', error);
    throw error;
  }
};

/**
 * Update a content item
 */
export const updateContentItem = async (itemId, updates) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, itemId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✏️ Content updated:', itemId);
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

/**
 * Get statistics about the vault
 */
export const getVaultStatistics = async () => {
  try {
    const allContent = await getAllContent();

    const stats = {
      total: allContent.length,
      byType: {},
      byCategory: {},
      byStorage: {},
      byYear: {},
    };

    allContent.forEach(item => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      stats.byStorage[item.storage] = (stats.byStorage[item.storage] || 0) + 1;
      stats.byYear[item.year] = (stats.byYear[item.year] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
};

export default {
  uploadMediaFile,
  saveContentItem,
  getAllContent,
  getContentByCategory,
  getContentByUser,
  getContentByType,
  deleteContentItem,
  permanentlyDeleteContentItem,
  updateContentItem,
  getVaultStatistics,
};


// Add this to your contentService.js


/**
 * Check the status of a Cloudflare Stream video
 */
export const checkVideoStatus = async (videoId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const token = await user.getIdToken();

    // Call your Firebase Function
    const response = await fetch(
      VIDEO_STATUS_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoId })
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking video status:', error);
    throw error;
  }
};

/**
 * Poll video status until it's ready
 */
export const waitForVideoReady = async (videoId, maxAttempts = 60, intervalMs = 5000) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const status = await checkVideoStatus(videoId);

      console.log(`Video ${videoId} status check ${i + 1}/${maxAttempts}:`, status.status);

      if (status.success && status.ready) {
        console.log('✅ Video is ready!');
        return status;
      }

      if (status.status === 'error') {
        throw new Error('Video processing failed');
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error('Error polling video status:', error);
      throw error;
    }
  }

  throw new Error('Video processing timeout - took too long to become ready');
};

/**
 * Refresh video data in Firebase after it becomes ready
 */
export const refreshVideoStatus = async (firestoreId, videoId) => {
  try {
    const status = await checkVideoStatus(videoId);

    if (status.success && status.ready) {
      // Update the Firestore document with the latest info
      const docRef = doc(db, COLLECTION_NAME, firestoreId);
      await updateDoc(docRef, {
        status: status.status,
        readyToStream: status.ready,
        duration: status.duration,
        thumbnailUrl: status.urls.thumbnail,
        embedUrl: status.urls.embed,
        url: status.urls.hls,
        dashUrl: status.urls.dash,
        updatedAt: new Date()
      });

      console.log('✅ Updated video status in Firebase');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error refreshing video status:', error);
    throw error;
  }
};
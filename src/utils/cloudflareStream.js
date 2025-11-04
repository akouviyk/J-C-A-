// Cloudflare Stream Upload via Firebase Function Proxy
// This approach prevents CORS issues and keeps API tokens secure

import { auth } from '../config/firebase';

// Firebase Functions endpoint
const FUNCTIONS_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL ||
  'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net';

/**
 * Upload a video to Cloudflare Stream via Firebase Function proxy
 * 
 * @param {File} file - The video file to upload
 * @param {string} name - The name for the video
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} - The uploaded video details
 */
/**
 * Upload to Cloudflare Stream - FIXED VERSION
 */
async function uploadToCloudflareStream(file, metadata, userId, accountId, apiToken) {
  const fs = require('fs');
  const formData = new FormData();

  formData.append('file', fs.createReadStream(file.path), {
    filename: file.name,
    contentType: file.type
  });

  // Add metadata
  const streamMetadata = {
    userId,
    category: metadata.category,
    type: metadata.type,
    collection: metadata.collection || 'americanparadisevault',
    uploadedAt: new Date().toISOString()
  };

  formData.append('meta', JSON.stringify(streamMetadata));

  console.log('Uploading to Cloudflare Stream...');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        ...formData.getHeaders()
      },
      body: formData
    }
  );

  const data = await response.json();

  if (!data.success) {
    console.error('Cloudflare Stream error:', data.errors);
    throw new Error(data.errors?.[0]?.message || 'Video upload failed');
  }

  const result = data.result;
  console.log('Cloudflare Stream upload successful:', result.uid);

  // Build customer subdomain (remove hyphens from account ID)
  const customerSubdomain = accountId.replace(/-/g, '');

  // FIXED: Return correct URLs
  // - url: HLS manifest for playback (not iframe!)
  // - embedUrl: iframe embed URL
  // - thumbnailUrl: thumbnail image with ?time parameter
  return {
    success: true,
    videoId: result.uid,
    mediaId: result.uid,
    // HLS manifest URL for direct playback
    url: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.m3u8`,
    playbackUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.m3u8`,
    // iframe embed URL - THIS is what should be used in iframes
    embedUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/iframe`,
    // Thumbnail with time parameter for better preview
    thumbnailUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/thumbnails/thumbnail.jpg?time=1s`,
    // DASH manifest (alternative to HLS)
    dashUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.mpd`,
    duration: result.duration,
    status: result.status?.state || 'processing',
    storage: 'cloudflare-stream',
    mediaType: 'video'
  };
}


/**
 * Note: The following functions are not used in the current implementation
 * but are kept for reference. They would require additional Firebase Functions.
 */

export const uploadFromUrlToCloudflareStream = async (url, name, metadata = {}) => {
  throw new Error('uploadFromUrlToCloudflareStream is not implemented. Use direct upload instead.');
};

export const getCloudflareStreamVideo = async (videoId) => {
  throw new Error('getCloudflareStreamVideo requires a Firebase Function implementation.');
};

export const deleteCloudflareStreamVideo = async (videoId) => {
  throw new Error('deleteCloudflareStreamVideo requires a Firebase Function implementation.');
};

export const listCloudflareStreamVideos = async (options = {}) => {
  throw new Error('listCloudflareStreamVideos requires a Firebase Function implementation.');
};

export const getCloudflareStreamEmbedHtml = (videoId, options = {}) => {
  const {
    controls = true,
    autoplay = false,
    loop = false,
    muted = false,
    preload = 'metadata',
    width = '100%',
    height = '100%',
    poster = ''
  } = options;

  const CF_CUSTOMER_SUBDOMAIN = process.env.REACT_APP_CF_CUSTOMER_SUBDOMAIN ||
    'customer-egd8wletnhjj8i2u';

  const params = new URLSearchParams({
    controls: controls.toString(),
    autoplay: autoplay.toString(),
    loop: loop.toString(),
    muted: muted.toString(),
    preload
  });

  if (poster) params.append('poster', poster);

  return `<iframe
    src="https://${CF_CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${videoId}/iframe?${params}"
    style="border: none; width: ${width}; height: ${height};"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
  ></iframe>`;
};

export const createDirectUploadUrl = async (metadata = {}) => {
  throw new Error('createDirectUploadUrl requires a Firebase Function implementation.');
};

export default {
  uploadToCloudflareStream,
  uploadFromUrlToCloudflareStream,
  getCloudflareStreamVideo,
  deleteCloudflareStreamVideo,
  listCloudflareStreamVideos,
  getCloudflareStreamEmbedHtml,
  createDirectUploadUrl
};

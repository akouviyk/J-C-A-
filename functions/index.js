const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { defineString } = require('firebase-functions/params');
const formidable = require('formidable-serverless');
const FormData = require('form-data');
const fetch = require('node-fetch');

admin.initializeApp();

const cloudflareAccountId = defineString('CLOUDFLARE_ACCOUNT_ID');
const cloudflareApiToken = defineString('CLOUDFLARE_API_TOKEN');

/**
 * Get a direct upload URL for large video files
 * This bypasses the Cloud Run 32MB limit by having the client upload directly to Cloudflare
 */
exports.getVideoUploadUrl = onRequest({
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MiB',
  invoker: 'public'
}, async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const accountId = cloudflareAccountId.value();
    const apiToken = cloudflareApiToken.value();

    if (!accountId || !apiToken) {
      res.status(500).json({ success: false, error: 'Missing Cloudflare credentials' });
      return;
    }

    const { fileName, fileSize } = req.body;

    console.log('Creating direct upload URL for:', fileName, 'Size:', fileSize, 'User:', decodedToken.uid);

    // Get direct upload URL from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maxDurationSeconds: 21600, // 6 hours max
          meta: {
            userId: decodedToken.uid,
            fileName: fileName,
            collection: 'americanparadisevault',
            uploadedAt: new Date().toISOString()
          },
          requireSignedURLs: false
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error('Cloudflare Stream error:', data.errors);
      throw new Error(data.errors?.[0]?.message || 'Failed to create upload URL');
    }

    console.log('✅ Direct upload URL created:', data.result.uid);

    res.json({
      success: true,
      uploadUrl: data.result.uploadURL,
      videoId: data.result.uid,
      accountId: accountId
    });

  } catch (error) {
    console.error('Error creating upload URL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Upload media to Cloudflare Images or Stream
 * Firebase Functions v2 (2nd Gen)
 * IMPORTANT: invoker: 'public' allows unauthenticated OPTIONS requests for CORS
 */
exports.uploadMedia = onRequest({
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 540,
  memory: '1GiB',
  invoker: 'public'  // CRITICAL: Allows OPTIONS preflight to work
}, async (req, res) => {
  // Set CORS headers FIRST - before any logic
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Max-Age', '3600');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST for actual uploads
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Check if Cloudflare credentials are configured
  const accountId = cloudflareAccountId.value();
  const apiToken = cloudflareApiToken.value();

  if (!accountId || !apiToken) {
    console.error('Missing Cloudflare credentials');
    res.status(500).json({
      success: false,
      error: 'Server configuration error: Missing Cloudflare credentials'
    });
    return;
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ success: false, error: 'Invalid authentication token' });
      return;
    }

    console.log('Authenticated user:', decodedToken.uid);

    // Parse multipart form data
    const form = new formidable.IncomingForm();
    form.maxFileSize = 200 * 1024 * 1024; // 200MB max

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }

    const metadata = JSON.parse(fields.metadata || '{}');
    const fileType = file.type || file.mimetype;

    console.log('Processing file:', file.name, 'Type:', fileType, 'Size:', file.size);

    // Route to appropriate Cloudflare service
    if (fileType.startsWith('video/')) {
      const result = await uploadToCloudflareStream(file, metadata, decodedToken.uid, accountId, apiToken);
      res.json(result);
    } else if (fileType.startsWith('image/')) {
      const result = await uploadToCloudflareImages(file, metadata, decodedToken.uid, accountId, apiToken);
      res.json(result);
    } else {
      res.status(400).json({
        success: false,
        error: `Unsupported file type: ${fileType}. Only images and videos are supported.`
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

/**
 * Upload to Cloudflare Images
 */
async function uploadToCloudflareImages(file, metadata, userId, accountId, apiToken) {
  const fs = require('fs');
  const formData = new FormData();

  formData.append('file', fs.createReadStream(file.path), {
    filename: file.name,
    contentType: file.type
  });

  // Add metadata
  formData.append('metadata', JSON.stringify({
    userId,
    category: metadata.category,
    type: metadata.type,
    collection: metadata.collection || 'americanparadisevault',
    uploadedAt: new Date().toISOString()
  }));

  // Require signed URLs for security (set to false for public access)
  formData.append('requireSignedURLs', 'false');

  console.log('Uploading to Cloudflare Images...');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
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
    console.error('Cloudflare Images error:', data.errors);
    throw new Error(data.errors?.[0]?.message || 'Image upload failed');
  }

  const result = data.result;
  console.log('Cloudflare Images upload successful:', result.id);

  return {
    success: true,
    imageId: result.id,
    mediaId: result.id,
    publicUrl: result.variants[0], // Public variant URL
    url: result.variants[0],
    thumbnailUrl: result.variants.find(v => v.includes('thumbnail')) || result.variants[0],
    largeUrl: result.variants.find(v => v.includes('large')) || result.variants[0],
    mediumUrl: result.variants.find(v => v.includes('medium')) || result.variants[0],
    smallUrl: result.variants.find(v => v.includes('small')) || result.variants[0],
    variants: result.variants,
    storage: 'cloudflare-images',
    mediaType: 'image'
  };
}

/**
 * Upload to Cloudflare Stream
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

  return {
    success: true,
    videoId: result.uid,
    mediaId: result.uid,
    playbackUrl: `https://customer-${accountId.replace(/-/g, '')}.cloudflarestream.com/${result.uid}/manifest/video.m3u8`,
    url: `https://customer-${accountId.replace(/-/g, '')}.cloudflarestream.com/${result.uid}/manifest/video.m3u8`,
    embedUrl: `https://customer-${accountId.replace(/-/g, '')}.cloudflarestream.com/${result.uid}/iframe`,
    thumbnailUrl: result.thumbnail || `https://customer-${accountId.replace(/-/g, '')}.cloudflarestream.com/${result.uid}/thumbnails/thumbnail.jpg`,
    dashUrl: `https://customer-${accountId.replace(/-/g, '')}.cloudflarestream.com/${result.uid}/manifest/video.mpd`,
    duration: result.duration,
    status: result.status?.state || 'processing',
    storage: 'cloudflare-stream',
    mediaType: 'video'
  };
}


// Add this to your Firebase Functions (index.js)

/**
 * Check the status of a Cloudflare Stream video
 * This helps debug why videos aren't loading
 */
exports.checkVideoStatus = onRequest({
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MiB',
  invoker: 'public'
}, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(idToken);

    const accountId = cloudflareAccountId.value();
    const apiToken = cloudflareApiToken.value();
    const { videoId } = req.body;

    if (!videoId) {
      res.status(400).json({ success: false, error: 'videoId required' });
      return;
    }

    console.log('Checking video status for:', videoId);

    // Get video details from Cloudflare Stream API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error('Cloudflare API error:', data.errors);
      res.json({
        success: false,
        error: data.errors?.[0]?.message || 'Failed to get video status',
        details: data.errors
      });
      return;
    }

    const result = data.result;
    const customerSubdomain = accountId.replace(/-/g, '');

    // Return comprehensive video information
    res.json({
      success: true,
      videoId: result.uid,
      status: result.status?.state || 'unknown',
      ready: result.readyToStream || false,
      duration: result.duration,
      created: result.created,
      modified: result.modified,
      size: result.size,

      // Playback URLs
      playback: result.playback,

      // Generated URLs (may not work until video is ready)
      urls: {
        hls: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.m3u8`,
        dash: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.mpd`,
        embed: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/iframe`,
        thumbnail: result.thumbnail || `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/thumbnails/thumbnail.jpg`,
      },

      // Raw result for debugging
      raw: result
    });

  } catch (error) {
    console.error('Error checking video status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// UPDATED uploadToCloudflareStream with better URL handling
async function uploadToCloudflareStream(file, metadata, userId, accountId, apiToken) {
  const fs = require('fs');
  const formData = new FormData();

  formData.append('file', fs.createReadStream(file.path), {
    filename: file.name,
    contentType: file.type
  });

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
  console.log('✅ Cloudflare Stream upload successful:', result.uid);
  console.log('Video status:', result.status);
  console.log('Ready to stream:', result.readyToStream);

  // IMPORTANT: Use the playback object if available (more reliable)
  const playbackUrls = result.playback || {};
  const customerSubdomain = accountId.replace(/-/g, '');

  // Return URLs - prefer playback.hls if available
  return {
    success: true,
    videoId: result.uid,
    mediaId: result.uid,

    // Use playback URLs from API response if available
    url: playbackUrls.hls || `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.m3u8`,
    playbackUrl: playbackUrls.hls || `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.m3u8`,
    embedUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/iframe`,
    dashUrl: playbackUrls.dash || `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/manifest/video.mpd`,

    // Thumbnail - use API response or construct URL
    thumbnailUrl: result.thumbnail || `https://customer-${customerSubdomain}.cloudflarestream.com/${result.uid}/thumbnails/thumbnail.jpg`,

    duration: result.duration,
    status: result.status?.state || 'processing',
    readyToStream: result.readyToStream || false,
    storage: 'cloudflare-stream',
    mediaType: 'video',

    // Include playback object for debugging
    playback: playbackUrls
  };
}


// In your Firebase Function (getvideouploadurl)
// This should be returning the customerSubdomain

exports.getVideoUploadUrl = onRequest(async (req, res) => {
  try {
    // Your existing auth code...

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    // Call Cloudflare to get direct upload URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          requireSignedURLs: false
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Failed to create upload URL');
    }

    // IMPORTANT: Calculate the correct customer subdomain
    // The customer subdomain is the account ID with hyphens removed
    // BUT in your case it's different, so we need to either:
    // 1. Hardcode it (if you only have one account)
    // 2. Store it in environment variables
    // 3. Get it from Cloudflare API

    // Option 1: Hardcode (simplest)
    const customerSubdomain = 'egd8wletnhjj8i2u';

    // Option 2: From environment variable (better)
    // const customerSubdomain = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN;

    // Option 3: Derive from account ID (doesn't work for your account)
    // const customerSubdomain = accountId.replace(/-/g, '');

    return res.json({
      uploadUrl: data.result.uploadURL,
      videoId: data.result.uid,
      accountId: accountId,
      customerSubdomain: customerSubdomain  // ADD THIS!
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});
// Cloudflare R2 Storage Configuration
// This handles image and audio file storage in R2 bucket: americanparadisevault

const CF_ACCOUNT_ID = process.env.REACT_APP_CF_ACCOUNT_ID || 'd4a0b2cf68aae5e594a5ceaeb0cba018';
const CF_API_TOKEN = process.env.REACT_APP_CF_API_TOKEN || '_4CLeeLUzscDS57mSkB4Rr0WIt9Y0NcsSQUPiwOL';
const CF_R2_BUCKET = 'americanparadisevault';
const CF_R2_PUBLIC_URL = process.env.REACT_APP_CF_R2_PUBLIC_URL || 'https://pub-YOUR_BUCKET_ID.r2.dev'; // Update this

/**
 * Generate a unique filename with timestamp and random string
 * @param {string} originalName - Original file name
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `${baseName}-${timestamp}-${randomStr}.${extension}`;
};

/**
 * Get content type category for organizing files
 * @param {string} fileType - MIME type
 * @returns {string} - Category folder name
 */
const getContentCategory = (fileType) => {
  if (fileType.startsWith('image/')) return 'images';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.startsWith('video/')) return 'videos'; // Fallback, prefer Stream
  if (fileType.includes('pdf')) return 'documents';
  return 'files';
};

/**
 * Upload file to Cloudflare R2 Storage
 * Note: This requires a backend/worker to handle the actual R2 upload
 * Frontend cannot directly upload to R2 due to CORS and authentication
 * 
 * @param {File} file - The file to upload
 * @param {string} contentType - Content type (photo, drawing, music, etc.)
 * @returns {Promise<Object>} - Upload result with URLs
 */
export const uploadToCloudflareR2 = async (file, contentType) => {
  try {
    const category = getContentCategory(file.type);
    const uniqueFilename = generateUniqueFilename(file.name);
    const key = `${category}/${uniqueFilename}`;

    // Convert file to base64 for transfer
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Call Cloudflare Worker/Backend endpoint to upload to R2
    // You'll need to deploy a Cloudflare Worker for this
    const workerUrl = process.env.REACT_APP_CF_R2_WORKER_URL || 'https://your-worker.your-subdomain.workers.dev/upload';
    
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CF_API_TOKEN}`,
      },
      body: JSON.stringify({
        bucket: CF_R2_BUCKET,
        key: key,
        data: base64Data,
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          category: contentType,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      fileId: key,
      url: `${CF_R2_PUBLIC_URL}/${key}`,
      publicUrl: `${CF_R2_PUBLIC_URL}/${key}`,
      key: key,
      category: category,
      size: file.size,
      contentType: file.type,
      originalName: file.name,
    };
  } catch (error) {
    console.error('Cloudflare R2 upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Alternative: Upload using presigned URL (requires backend)
 * This is more secure and performant
 */
export const uploadToR2WithPresignedUrl = async (file, contentType) => {
  try {
    const category = getContentCategory(file.type);
    const uniqueFilename = generateUniqueFilename(file.name);
    const key = `${category}/${uniqueFilename}`;

    // Step 1: Get presigned URL from your backend
    const presignResponse = await fetch('/api/r2/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: key,
        contentType: file.type,
      }),
    });

    if (!presignResponse.ok) {
      throw new Error('Failed to get presigned URL');
    }

    const { uploadUrl, publicUrl } = await presignResponse.json();

    // Step 2: Upload directly to R2 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload to R2 failed');
    }

    return {
      success: true,
      fileId: key,
      url: publicUrl,
      publicUrl: publicUrl,
      key: key,
      category: category,
      size: file.size,
      contentType: file.type,
      originalName: file.name,
    };
  } catch (error) {
    console.error('R2 presigned upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete file from Cloudflare R2
 * @param {string} fileKey - The R2 object key to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudflareR2 = async (fileKey) => {
  try {
    const workerUrl = process.env.REACT_APP_CF_R2_WORKER_URL || 'https://your-worker.your-subdomain.workers.dev/delete';
    
    const response = await fetch(workerUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CF_API_TOKEN}`,
      },
      body: JSON.stringify({
        bucket: CF_R2_BUCKET,
        key: fileKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Cloudflare R2 delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  uploadToCloudflareR2,
  uploadToR2WithPresignedUrl,
  deleteFromCloudflareR2,
};

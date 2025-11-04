// Cloudflare Images Upload via Firebase Function Proxy
// This approach prevents CORS issues and keeps API tokens secure

import { auth } from '../config/firebase';

// Firebase Functions endpoint
const FUNCTIONS_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || 
  'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net';

/**
 * Upload an image to Cloudflare Images via Firebase Function proxy
 * 
 * @param {File} file - The image file to upload
 * @param {string} name - The name for the image
 * @param {Object} metadata - Additional metadata (category, type, etc.)
 * @returns {Promise<Object>} - The uploaded image details
 */
export const uploadToCloudflareImages = async (file, name, metadata = {}) => {
  try {
    // Get Firebase auth token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to upload');
    }
    const idToken = await user.getIdToken();

    // Convert file to base64
    const fileData = await fileToBase64(file);

    // Call Firebase Function
    const response = await fetch(`${FUNCTIONS_BASE_URL}/uploadToCloudflareImages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        fileData,
        fileName: name || file.name,
        metadata: {
          category: metadata.category || 'images',
          type: metadata.type || 'image',
          collection: 'americanparadisevault',
          ...metadata
        }
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    console.log('✅ Image uploaded successfully:', data.imageId);
    return data;

  } catch (error) {
    console.error('❌ Cloudflare Images upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Helper function to convert File to base64
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Note: The following functions are not used in the current implementation
 * but are kept for reference. They would require additional Firebase Functions.
 */

export const uploadImageFromUrl = async (imageUrl, name, metadata = {}) => {
  throw new Error('uploadImageFromUrl is not implemented. Use direct upload instead.');
};

export const getCloudflareImage = async (imageId) => {
  throw new Error('getCloudflareImage requires a Firebase Function implementation.');
};

export const deleteCloudflareImage = async (imageId) => {
  throw new Error('deleteCloudflareImage requires a Firebase Function implementation.');
};

export const listCloudflareImages = async (page = 1, perPage = 100) => {
  throw new Error('listCloudflareImages requires a Firebase Function implementation.');
};

export default {
  uploadToCloudflareImages,
  uploadImageFromUrl,
  getCloudflareImage,
  deleteCloudflareImage,
  listCloudflareImages
};

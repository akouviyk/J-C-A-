/**
 * Migration Script: Clean Base64 Data from Firestore
 * 
 * This script removes any base64 data URLs from existing Firestore documents
 * and sets them to null, ensuring only external URLs are stored.
 * 
 * Usage:
 * 1. Ensure you're logged in: firebase login
 * 2. Run: node src/scripts/cleanBase64Data.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Import your Firebase config
import { db } from '../config/firebase';

const COLLECTION_NAME = 'americanparadisevault';

/**
 * Check if a URL is a base64 data URL
 */
const isBase64Url = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('data:') || url.includes('base64');
};

/**
 * Check if a URL is a Firebase Storage URL
 */
const isFirebaseStorageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('firebasestorage.googleapis.com');
};

/**
 * Main migration function
 */
const cleanBase64Data = async () => {
  console.log('🧹 Starting base64 cleanup migration...\n');

  try {
    // Get all documents
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    console.log(`📦 Found ${querySnapshot.docs.length} documents\n`);

    let updatedCount = 0;
    let base64Count = 0;
    let firebaseStorageCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const updates = {};
      let needsUpdate = false;

      // Check and clean url
      if (data.url) {
        if (isBase64Url(data.url)) {
          console.log(`❌ [${docSnapshot.id}] Found base64 URL`);
          updates.url = null;
          updates.storage = 'placeholder';
          needsUpdate = true;
          base64Count++;
        } else if (isFirebaseStorageUrl(data.url)) {
          console.log(`⚠️  [${docSnapshot.id}] Found Firebase Storage URL`);
          // Keep Firebase Storage URLs but flag them
          updates.storage = 'firebase-storage';
          needsUpdate = true;
          firebaseStorageCount++;
        }
      }

      // Check and clean thumbnailUrl
      if (data.thumbnailUrl && isBase64Url(data.thumbnailUrl)) {
        console.log(`❌ [${docSnapshot.id}] Found base64 thumbnailUrl`);
        updates.thumbnailUrl = null;
        needsUpdate = true;
      }

      // Check and clean embedUrl
      if (data.embedUrl && isBase64Url(data.embedUrl)) {
        console.log(`❌ [${docSnapshot.id}] Found base64 embedUrl`);
        updates.embedUrl = null;
        needsUpdate = true;
      }

      // Update document if needed
      if (needsUpdate) {
        updates.updatedAt = serverTimestamp();
        updates.migratedAt = serverTimestamp();
        
        await updateDoc(doc(db, COLLECTION_NAME, docSnapshot.id), updates);
        updatedCount++;
        console.log(`✅ [${docSnapshot.id}] Cleaned and updated\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total documents: ${querySnapshot.docs.length}`);
    console.log(`Documents updated: ${updatedCount}`);
    console.log(`Base64 URLs removed: ${base64Count}`);
    console.log(`Firebase Storage URLs found: ${firebaseStorageCount}`);
    console.log('='.repeat(60) + '\n');

    if (updatedCount > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('1. Review the updated documents in Firestore');
      console.log('2. Users with null URLs will need to re-upload their content');
      console.log('3. Consider notifying affected users\n');
    } else {
      console.log('✅ No documents needed cleaning - database is already clean!\n');
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

// Run the migration
cleanBase64Data()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

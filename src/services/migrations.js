/**
 * Migration utility for americanparadisevault collection
 * Use this to update existing documents or fix data issues
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'americanparadisevault';

/**
 * Update category mapping for all documents
 * Run this if you change the type → category mapping
 */
export const migrateCategoryMapping = async () => {
  const mapping = {
    'photo': 'art',
    'drawing': 'drawings',
    'video': 'art',
    'music': 'music',
    'writing': 'writing',
    'architecture': 'art'
  };

  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const batch = writeBatch(db);
    let updateCount = 0;

    querySnapshot.forEach((document) => {
      const data = document.data();
      const newCategory = mapping[data.type];
      
      if (data.category !== newCategory) {
        const docRef = doc(db, COLLECTION_NAME, document.id);
        batch.update(docRef, { 
          category: newCategory,
          updatedAt: new Date()
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updateCount} documents with correct category mapping`);
    } else {
      console.log('✅ All documents already have correct category mapping');
    }

    return { success: true, updated: updateCount };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add missing fields to existing documents
 */
export const addMissingFields = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const batch = writeBatch(db);
    let updateCount = 0;

    querySnapshot.forEach((document) => {
      const data = document.data();
      const updates = {};

      // Add status if missing
      if (!data.status) {
        updates.status = 'active';
      }

      // Add year if missing
      if (!data.year) {
        const createdAt = data.createdAt?.toDate();
        updates.year = createdAt 
          ? createdAt.getFullYear().toString() 
          : new Date().getFullYear().toString();
      }

      // Add isPlaceholder if missing
      if (data.isPlaceholder === undefined) {
        updates.isPlaceholder = false;
      }

      // Add position if missing
      if (!data.position) {
        updates.position = {
          x: Math.random() * 800 + 100,
          y: Math.random() * 400 + 150
        };
      }

      if (Object.keys(updates).length > 0) {
        const docRef = doc(db, COLLECTION_NAME, document.id);
        batch.update(docRef, {
          ...updates,
          updatedAt: new Date()
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Added missing fields to ${updateCount} documents`);
    } else {
      console.log('✅ All documents have required fields');
    }

    return { success: true, updated: updateCount };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clean up deleted/invalid documents
 */
export const cleanupInvalidDocuments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const batch = writeBatch(db);
    let deleteCount = 0;

    querySnapshot.forEach((document) => {
      const data = document.data();
      
      // Delete if missing critical fields
      if (!data.type || !data.url || !data.createdBy) {
        const docRef = doc(db, COLLECTION_NAME, document.id);
        batch.delete(docRef);
        deleteCount++;
        console.log(`Marking for deletion: ${document.id} (missing critical fields)`);
      }
    });

    if (deleteCount > 0) {
      await batch.commit();
      console.log(`✅ Deleted ${deleteCount} invalid documents`);
    } else {
      console.log('✅ No invalid documents found');
    }

    return { success: true, deleted: deleteCount };
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get statistics about the collection
 */
export const getCollectionStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    const stats = {
      total: 0,
      byType: {},
      byCategory: {},
      byStatus: {},
      byUser: {},
      placeholders: 0,
      withMedia: 0
    };

    querySnapshot.forEach((document) => {
      const data = document.data();
      stats.total++;

      // Count by type
      stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;

      // Count by category
      stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;

      // Count by status
      stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1;

      // Count by user
      const userEmail = data.createdBy?.email || 'anonymous';
      stats.byUser[userEmail] = (stats.byUser[userEmail] || 0) + 1;

      // Count placeholders
      if (data.isPlaceholder) {
        stats.placeholders++;
      }

      // Count items with Cloudflare media
      if (data.mediaId) {
        stats.withMedia++;
      }
    });

    console.log('📊 Collection Statistics:');
    console.log('========================');
    console.log(`Total Documents: ${stats.total}`);
    console.log(`\nBy Type:`, stats.byType);
    console.log(`\nBy Category:`, stats.byCategory);
    console.log(`\nBy Status:`, stats.byStatus);
    console.log(`\nBy User:`, stats.byUser);
    console.log(`\nPlaceholders: ${stats.placeholders}`);
    console.log(`With Cloudflare Media: ${stats.withMedia}`);

    return stats;
  } catch (error) {
    console.error('❌ Stats error:', error);
    return null;
  }
};

/**
 * Export all documents to JSON
 */
export const exportToJson = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const documents = [];

    querySnapshot.forEach((document) => {
      documents.push({
        id: document.id,
        ...document.data()
      });
    });

    const json = JSON.stringify(documents, null, 2);
    console.log('📄 Export complete. Copy the JSON below:');
    console.log('==========================================');
    console.log(json);

    return documents;
  } catch (error) {
    console.error('❌ Export error:', error);
    return null;
  }
};

/**
 * Run all migrations
 */
export const runAllMigrations = async () => {
  console.log('🚀 Starting migrations...\n');

  console.log('Step 1: Getting collection statistics...');
  await getCollectionStats();

  console.log('\nStep 2: Adding missing fields...');
  await addMissingFields();

  console.log('\nStep 3: Updating category mapping...');
  await migrateCategoryMapping();

  console.log('\nStep 4: Cleaning up invalid documents...');
  await cleanupInvalidDocuments();

  console.log('\n✅ All migrations complete!');
  console.log('\nFinal statistics:');
  await getCollectionStats();
};

// Export individual functions
export default {
  migrateCategoryMapping,
  addMissingFields,
  cleanupInvalidDocuments,
  getCollectionStats,
  exportToJson,
  runAllMigrations
};

// Usage in browser console:
// import migrations from './services/migrations';
// await migrations.runAllMigrations();
// or
// await migrations.getCollectionStats();

import dotenv from 'dotenv';
import path from 'path';
import { MongoClient } from 'mongodb';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

async function migrateSettings() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');
    
    const db = client.db();
    const settingsCollection = db.collection('settings');
    
    // Find old settings
    const oldSettings = await settingsCollection.findOne({ _id: 'site-settings' as any });
    
    if (oldSettings) {
      // Check if new document already exists
      const existingNew = await settingsCollection.findOne({ _id: 'homepage-hero' as any });
      if (existingNew) {
        console.log('⚠️  homepage-hero document already exists. Skipping migration.');
        return;
      }
      
      // Create new document with new ID
      await settingsCollection.insertOne({
        ...oldSettings,
        _id: 'homepage-hero' as any,
      });
      
      // Delete old document
      await settingsCollection.deleteOne({ _id: 'site-settings' as any });
      
      console.log('✅ Settings migrated from site-settings to homepage-hero');
    } else {
      console.log('ℹ️  No site-settings document found');
    }
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

migrateSettings()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });


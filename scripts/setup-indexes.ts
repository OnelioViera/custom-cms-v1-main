import dotenv from 'dotenv';
import path from 'path';
import { MongoClient } from 'mongodb';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

async function setupIndexes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');
    
    const db = client.db();
    console.log(`Using database: ${db.databaseName}`);
    console.log('\nSetting up database indexes...');

    // Pages Collection Indexes
    console.log('Creating indexes for pages collection...');
    await db.collection('pages').createIndex({ slug: 1 }, { unique: true });
    await db.collection('pages').createIndex({ status: 1 });
    await db.collection('pages').createIndex({ title: 'text', content: 'text' });
    await db.collection('pages').createIndex({ createdAt: -1 });
    await db.collection('pages').createIndex({ updatedAt: -1 });

    // Projects Collection Indexes
    console.log('Creating indexes for projects collection...');
    await db.collection('projects').createIndex({ slug: 1 }, { unique: true });
    await db.collection('projects').createIndex({ status: 1 });
    await db.collection('projects').createIndex({ featured: 1 });
    await db.collection('projects').createIndex({ title: 'text', description: 'text', content: 'text' });
    await db.collection('projects').createIndex({ createdAt: -1 });
    await db.collection('projects').createIndex({ client: 1 });

    // Team Collection Indexes
    console.log('Creating indexes for team collection...');
    await db.collection('team').createIndex({ slug: 1 }, { unique: true });
    await db.collection('team').createIndex({ status: 1 });
    await db.collection('team').createIndex({ order: 1 });
    await db.collection('team').createIndex({ name: 'text', position: 'text', bio: 'text' });
    await db.collection('team').createIndex({ email: 1 }, { sparse: true });

    // Services Collection Indexes
    console.log('Creating indexes for services collection...');
    await db.collection('services').createIndex({ slug: 1 }, { unique: true });
    await db.collection('services').createIndex({ status: 1 });
    await db.collection('services').createIndex({ order: 1 });
    await db.collection('services').createIndex({ title: 'text', shortDescription: 'text' });

    // Users Collection Indexes
    console.log('Creating indexes for users collection...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    // GridFS Files Indexes (for image storage)
    console.log('Creating indexes for GridFS files...');
    await db.collection('uploads.files').createIndex({ filename: 1 });
    await db.collection('uploads.files').createIndex({ uploadDate: -1 });
    await db.collection('uploads.files').createIndex({ 'metadata.contentType': 1 });

    console.log('\n✅ All indexes created successfully!');
    
    // List all indexes
    console.log('\nCurrent indexes:');
    const collections = ['pages', 'projects', 'team', 'services', 'users', 'uploads.files'];
    
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`\n${collectionName}:`);
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }

  } catch (error) {
    console.error('Error setting up indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

setupIndexes();

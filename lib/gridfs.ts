import { getDatabase } from './mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';

let bucket: GridFSBucket | null = null;

export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (bucket) return bucket;
  
  const db = await getDatabase();
  bucket = new GridFSBucket(db, {
    bucketName: 'uploads'
  });
  
  return bucket;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = await getGridFSBucket();
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        contentType,
        uploadedAt: new Date()
      }
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(uploadStream.id as ObjectId);
    });

    uploadStream.end(buffer);
  });
}

export async function deleteFile(fileId: string): Promise<void> {
  const bucket = await getGridFSBucket();
  await bucket.delete(new ObjectId(fileId));
}

export async function getFile(fileId: string) {
  const bucket = await getGridFSBucket();
  const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
  
  if (files.length === 0) {
    return null;
  }
  
  return files[0];
}

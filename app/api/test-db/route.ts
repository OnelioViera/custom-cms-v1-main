import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Try to list collections to verify connection
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!',
      database: db.databaseName,
      collections: collections.map(col => col.name)
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

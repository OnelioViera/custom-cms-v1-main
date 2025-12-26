import { NextRequest, NextResponse } from 'next/server';
import { getGridFSBucket, getFile } from '@/lib/gridfs';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    console.log('=== FILE SERVING DEBUG ===');
    console.log('Requested file ID:', id);
    
    // Get file metadata
    const file = await getFile(id);
    
    console.log('File metadata:', file);
    
    if (!file) {
      console.log('File not found in GridFS');
      return new NextResponse('File not found', { status: 404 });
    }

    // Get GridFS bucket
    const bucket = await getGridFSBucket();
    
    // Create download stream
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    
    return new Promise<NextResponse>((resolve, reject) => {
      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('error', reject);
      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Access contentType from metadata or use fallback
        const contentType = file.metadata?.contentType || 'image/jpeg';
        
        console.log('Serving with Content-Type:', contentType);
        
        resolve(
          new NextResponse(buffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          })
        );
      });
    });
  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Failed to serve file', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deleteFile } = await import('@/lib/gridfs');
    
    await deleteFile(id);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

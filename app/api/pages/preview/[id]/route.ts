import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');

    // Get page regardless of status (including drafts)
    const page = await pagesCollection.findOne({ _id: new ObjectId(id) });

    if (!page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        _id: page._id?.toString()
      }
    });
  } catch (error) {
    console.error('Preview page error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Search query required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');

    // Use text index for search
    const pages = await pagesCollection
      .find({
        $text: { $search: query },
        status: 'published'
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .toArray();

    return NextResponse.json({
      success: true,
      pages: pages.map(page => ({
        ...page,
        _id: page._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    );
  }
}

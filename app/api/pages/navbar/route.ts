import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';

// GET pages for navbar
export async function GET() {
  try {
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');
    
    const pages = await pagesCollection
      .find({ 
        status: 'published',
        showInNavbar: true 
      })
      .sort({ navbarOrder: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      pages: pages.map(page => ({
        title: page.title,
        slug: page.slug,
        openInNewTab: page.openInNewTab || false,
        navbarOrder: page.navbarOrder || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching navbar pages:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch navbar pages',
      pages: []
    }, { status: 500 });
  }
}


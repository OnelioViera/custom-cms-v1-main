import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';

// GET all pages
export async function GET() {
  try {
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');
    
    const pages = await pagesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      pages: pages.map(page => ({
        ...page,
        _id: page._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch pages',
      pages: []
    }, { status: 500 });
  }
}

// POST create new page
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');

    // Check if slug already exists
    const existingPage = await pagesCollection.findOne({ slug: body.slug });
    if (existingPage) {
      return NextResponse.json({
        success: false,
        message: 'A page with this slug already exists'
      }, { status: 400 });
    }

    // Get max navbar order
    const maxNavbarOrder = await pagesCollection
      .findOne({}, { sort: { navbarOrder: -1 } });
    const nextNavbarOrder = maxNavbarOrder?.navbarOrder !== undefined 
      ? (maxNavbarOrder.navbarOrder || 0) + 1 
      : 0;

    const newPage: Page = {
      title: body.title,
      slug: body.slug,
      content: body.content || '',
      metaTitle: body.metaTitle || '',
      metaDescription: body.metaDescription || '',
      status: body.status || 'draft',
      showInNavbar: body.showInNavbar || false,
      navbarOrder: body.showInNavbar ? (body.navbarOrder ?? nextNavbarOrder) : undefined,
      openInNewTab: body.openInNewTab || false,
      blocks: body.blocks || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy || 'admin', // You might want to get this from auth
    };

    const result = await pagesCollection.insertOne(newPage);

    // Invalidate cache
    const { cache } = await import('@/lib/cache');
    cache.delete('pages:published');

    return NextResponse.json({
      success: true,
      message: 'Page created successfully',
      page: {
        ...newPage,
        _id: result.insertedId.toString()
      },
      pageId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create page',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

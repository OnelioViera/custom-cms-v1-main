import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

// GET single page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ObjectId format
    if (!id || id === 'undefined' || !ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid page ID'
      }, { status: 400 });
    }

    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');
    
    const page = await pagesCollection.findOne({ _id: new ObjectId(id) });

    if (!page) {
      return NextResponse.json({
        success: false,
        message: 'Page not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        _id: page._id?.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch page',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT update page
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ObjectId format
    if (!id || id === 'undefined' || !ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid page ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');

    // Check if slug is being changed and if it conflicts with another page
    if (body.slug) {
      const existingPage = await pagesCollection.findOne({ 
        slug: body.slug,
        _id: { $ne: new ObjectId(id) }
      });
      if (existingPage) {
        return NextResponse.json({
          success: false,
          message: 'A page with this slug already exists'
        }, { status: 400 });
      }
    }

    // Get max navbar order if needed
    const maxNavbarOrder = await pagesCollection
      .findOne({}, { sort: { navbarOrder: -1 } });
    const nextNavbarOrder = maxNavbarOrder?.navbarOrder !== undefined 
      ? (maxNavbarOrder.navbarOrder || 0) + 1 
      : 0;

    const updateData: any = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      status: body.status,
      showInNavbar: body.showInNavbar || false,
      openInNewTab: body.openInNewTab || false,
      blocks: body.blocks || [],
      updatedAt: new Date()
    };

    // Handle navbar order
    if (body.showInNavbar) {
      updateData.navbarOrder = body.navbarOrder ?? nextNavbarOrder;
    } else {
      updateData.navbarOrder = undefined;
    }

    const result = await pagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Page not found'
      }, { status: 404 });
    }

    // Invalidate cache
    cache.delete('pages:published');
    cache.delete(`page:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update page',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE page
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ObjectId format
    if (!id || id === 'undefined' || !ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid page ID'
      }, { status: 400 });
    }

    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');

    const result = await pagesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Page not found'
      }, { status: 404 });
    }

    // Invalidate cache
    cache.delete('pages:published');
    cache.delete(`page:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete page',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

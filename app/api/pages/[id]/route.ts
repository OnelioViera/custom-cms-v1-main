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
      message: 'Failed to fetch page'
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
    const body = await request.json();
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');

    const updateData = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      status: body.status,
      updatedAt: new Date()
    };

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
      message: 'Failed to update page'
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
      message: 'Failed to delete page'
    }, { status: 500 });
  }
}

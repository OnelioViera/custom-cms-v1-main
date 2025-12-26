import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Service } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET single service
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const cached = cache.get(`service:${id}`);
    if (cached) {
      return NextResponse.json(cached);
    }

    const db = await getDatabase();
    const servicesCollection = db.collection('services');
    
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    const result = {
      success: true,
      service: {
        ...service,
        _id: service._id?.toString()
      }
    };

    cache.set(`service:${id}`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const db = await getDatabase();
    const servicesCollection = db.collection('services');

    const updateData = {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription || '',
      content: data.content || '',
      status: data.status,
      order: data.order || 0,
      updatedAt: new Date(),
    };

    await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    cache.delete('services:all');
    cache.delete('services:published');
    cache.delete(`service:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE service
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = await getDatabase();
    const servicesCollection = db.collection('services');

    const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    cache.delete('services:all');
    cache.delete('services:published');
    cache.delete(`service:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Service } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

// GET all services
export async function GET() {
  try {
    const cached = cache.get('services:all');
    if (cached) {
      return NextResponse.json(cached);
    }

    const db = await getDatabase();
    const servicesCollection = db.collection('services');
    
    const services = await servicesCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    const result = {
      success: true,
      services: services.map(s => ({
        ...s,
        _id: s._id?.toString()
      }))
    };

    cache.set('services:all', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    const servicesCollection = db.collection('services');

    const newService = {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription || '',
      content: data.content || '',
      status: data.status || 'active',
      order: data.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await servicesCollection.insertOne(newService);

    cache.delete('services:all');
    cache.delete('services:published');

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      serviceId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET single team member
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const cached = cache.get(`team:${id}`);
    if (cached) {
      return NextResponse.json(cached);
    }

    const db = await getDatabase();
    const teamCollection = db.collection('team');
    
    const member = await teamCollection.findOne({ _id: new ObjectId(id) });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    const result = {
      success: true,
      member: {
        ...member,
        _id: member._id?.toString()
      }
    };

    cache.set(`team:${id}`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

// PUT - Update team member
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const db = await getDatabase();
    const teamCollection = db.collection('team');

    const updateData = {
      name: data.name,
      slug: data.slug,
      role: data.role,
      bio: data.bio || '',
      image: data.image || data.photo || '',
      email: data.email || '',
      phone: data.phone || '',
      linkedin: data.linkedin || '',
      order: data.order || 0,
      updatedAt: new Date(),
    };

    await teamCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    cache.delete('team:all');
    cache.delete('team:published');
    cache.delete(`team:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE team member
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = await getDatabase();
    const teamCollection = db.collection('team');

    const result = await teamCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    cache.delete('team:all');
    cache.delete('team:published');
    cache.delete(`team:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}

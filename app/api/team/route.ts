import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cache } from '@/lib/cache';

// GET all team members
export async function GET() {
  try {
    const cached = cache.get('team:all');
    if (cached) {
      return NextResponse.json(cached);
    }

    const db = await getDatabase();
    const teamCollection = db.collection('team');
    
    const members = await teamCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    const result = {
      success: true,
      members: members.map(m => ({
        ...m,
        _id: m._id?.toString()
      }))
    };

    cache.set('team:all', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    const teamCollection = db.collection('team');

    const newMember = {
      name: data.name,
      slug: data.slug,
      role: data.role,
      bio: data.bio || '',
      image: data.image || data.photo || '',
      email: data.email || '',
      phone: data.phone || '',
      linkedin: data.linkedin || '',
      order: data.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await teamCollection.insertOne(newMember);

    cache.delete('team:all');
    cache.delete('team:published');

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      memberId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

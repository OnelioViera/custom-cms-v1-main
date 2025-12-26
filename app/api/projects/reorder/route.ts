import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

export async function PUT(request: NextRequest) {
  try {
    const { projects } = await request.json();

    const db = await getDatabase();
    const projectsCollection = db.collection('projects');

    // Update all project orders
    const updatePromises = projects.map((project: { _id: string; order: number }) =>
      projectsCollection.updateOne(
        { _id: new ObjectId(project._id) },
        { $set: { order: project.order, updatedAt: new Date() } }
      )
    );

    await Promise.all(updatePromises);

    // Invalidate cache
    cache.delete('projects:published');
    cache.delete('projects:all');

    return NextResponse.json({
      success: true,
      message: 'Project order updated successfully',
    });
  } catch (error) {
    console.error('Error updating project order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update project order' },
      { status: 500 }
    );
  }
}

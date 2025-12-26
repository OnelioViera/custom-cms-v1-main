import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

// GET single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const projectsCollection = db.collection<Project>('projects');

    const project = await projectsCollection.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        _id: project._id?.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const db = await getDatabase();
    const projectsCollection = db.collection('projects');

    const updateData = {
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      content: data.content || '',
      images: data.images || [],
      backgroundImage: data.backgroundImage || '',
      client: data.client || '',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status,
      featured: data.featured,
      updatedAt: new Date(),
    };

    await projectsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    cache.delete('projects:published');
    cache.delete('projects:all');
    cache.delete(`project:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const projectsCollection = db.collection<Project>('projects');

    const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    cache.delete('projects:published');
    cache.delete('projects:all');
    cache.delete(`project:${id}`);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

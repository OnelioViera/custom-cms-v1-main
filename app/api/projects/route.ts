import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { withCache, cache } from '@/lib/cache';
import { measureAsync } from '@/lib/monitoring/performance';
import { errorLogger } from '@/lib/monitoring/errors';
import { config } from '@/lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    const projects = await withCache(
      includeAll ? 'projects:all' : 'projects:published',
      async () => {
        return await measureAsync('api.projects.get', async () => {
          const db = await getDatabase();
          const projectsCollection = db.collection<Project>('projects');
          
          // Admin gets all statuses, public gets only in-progress and completed
          const statusFilter = includeAll 
            ? { status: { $in: ['planning' as const, 'in-progress' as const, 'completed' as const] } }
            : { status: { $in: ['in-progress' as const, 'completed' as const] } };
          
          return await projectsCollection
            .find(statusFilter)
            .sort({ createdAt: -1 })
            .toArray();
        });
      },
      config.get('CACHE_TTL_PROJECTS')
    );

    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        ...project,
        _id: project._id?.toString()
      }))
    });
  } catch (error) {
    errorLogger.error('Failed to fetch projects', error as Error, {
      endpoint: '/api/projects',
      method: 'GET',
    });

    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    const projectsCollection = db.collection('projects');

    const newProject = {
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      content: data.content || '',
      images: data.images || [],
      backgroundImage: data.backgroundImage || '',
      client: data.client || '',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status || 'planning',
      featured: data.featured || false,
      order: 999,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await projectsCollection.insertOne(newProject);

    cache.delete('projects:published');
    cache.delete('projects:all');

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      projectId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create project' },
      { status: 500 }
    );
  }
}

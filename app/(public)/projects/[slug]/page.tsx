import { notFound } from 'next/navigation';
import { generateMetadata as generateMeta } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/Content';

async function getProject(slug: string) {
  try {
    const db = await getDatabase();
    const projectsCollection = db.collection<Project>('projects');
    
    const project = await projectsCollection.findOne({ slug });

    if (!project) {
      return null;
    }

    return {
      ...project,
      _id: project._id?.toString()
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return generateMeta({
    title: project.title,
    description: project.description,
    url: `/projects/${project.slug}`,
    image: project.images?.[0],
    type: 'article',
    publishedTime: project.createdAt ? new Date(project.createdAt).toISOString() : undefined,
    keywords: [project.client, 'project', 'precast concrete'].filter(Boolean) as string[],
  });
}

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Project',
    name: project.title,
    description: project.description,
    image: project.images?.[0],
    client: project.client,
    startDate: project.startDate,
    endDate: project.endDate,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="bg-blue-700">
              {project.status === 'in-progress' ? 'In Progress' : project.status}
            </Badge>
            {project.featured && (
              <Badge variant="outline" className="border-white text-white">
                Featured
              </Badge>
            )}
          </div>
          <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
          {project.client && (
            <p className="text-xl text-blue-100">Client: {project.client}</p>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {project.images && project.images[0] && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
              {project.startDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Project Timeline</h3>
                    <p className="text-gray-600">
                      {new Date(project.startDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                      {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}`}
                    </p>
                  </div>
                </div>
              )}
              {project.client && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Client</h3>
                    <p className="text-gray-600">{project.client}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {project.description}
              </p>
            </div>

            {project.content && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Details</h2>
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.content }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

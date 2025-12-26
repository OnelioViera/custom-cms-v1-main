import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, X, Calendar, User } from 'lucide-react';

async function getPreviewProject(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/preview/${id}`, {
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (!data.success) return null;
    return data.project;
  } catch (error) {
    console.error('Error fetching preview project:', error);
    return null;
  }
}

export default async function PreviewProjectPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const project = await getPreviewProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-white py-3 px-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <span className="font-semibold">Preview Mode</span>
            <span className="text-yellow-100">({project.status})</span>
          </div>
          <Link href={`/admin/projects/${project._id}`}>
            <Button variant="secondary" size="sm">
              <X className="w-4 h-4 mr-2" />
              Exit Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Project Content */}
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
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Project Info */}
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

            {/* Description */}
            {project.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}

            {/* Full Content */}
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
    </div>
  );
}

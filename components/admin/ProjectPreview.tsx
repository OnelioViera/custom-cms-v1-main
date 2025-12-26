'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface ProjectPreviewProps {
  project: {
    title: string;
    slug: string;
    description: string;
    client?: string;
    images?: string[];
    backgroundImage?: string;
    status: string;
    featured: boolean;
  };
}

export default function ProjectPreview({ project }: ProjectPreviewProps) {
  const displayImage = project.backgroundImage || project.images?.[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'planning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <p className="text-sm text-gray-600">How this project will appear</p>
        </div>

        {/* Card Preview */}
        <div className="p-4">
          <div className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
            {/* Image */}
            {displayImage ? (
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={displayImage}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {project.title.substring(0, 2).toUpperCase() || 'No Image'}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {project.title || 'Project Title'}
                </h3>
                {project.featured && (
                  <Badge variant="default" className="shrink-0">Featured</Badge>
                )}
              </div>
              
              {project.client && (
                <p className="text-sm text-gray-500 mb-2">
                  Client: {project.client}
                </p>
              )}
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description || 'Add a description to see it here...'}
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-gray-50 border-t px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600">Slug</p>
              <p className="font-medium truncate">/{project.slug || 'project-slug'}</p>
            </div>
            <div>
              <p className="text-gray-600">Images</p>
              <p className="font-medium">{project.images?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 SEO Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Title length: {project.title?.length || 0}/60 characters</li>
          <li>• Description: {project.description?.length || 0}/160 characters</li>
          <li>• {displayImage ? '✓' : '✗'} Has featured image</li>
          <li>• Slug: {project.slug?.length > 0 ? '✓ Valid' : '✗ Missing'}</li>
        </ul>
      </div>
    </div>
  );
}


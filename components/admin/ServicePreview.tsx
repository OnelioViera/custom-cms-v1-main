'use client';

import { Badge } from '@/components/ui/badge';

interface ServicePreviewProps {
  service: {
    title: string;
    slug: string;
    shortDescription: string;
    status: string;
  };
}

export default function ServicePreview({ service }: ServicePreviewProps) {
  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <p className="text-sm text-gray-600">How this service will appear</p>
        </div>

        {/* Card Preview */}
        <div className="p-4">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {service.title || 'Service Title'}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {service.shortDescription || 'Add a short description to see it here...'}
            </p>
            <span className="text-blue-600 font-medium hover:text-blue-700">
              Learn more →
            </span>
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-gray-50 border-t px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600">Slug</p>
              <p className="font-medium truncate">/services/{service.slug || 'service-slug'}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <Badge variant="secondary" className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 SEO Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Title length: {service.title?.length || 0}/60 characters</li>
          <li>• Description: {service.shortDescription?.length || 0}/160 characters</li>
          <li>• Slug: {service.slug?.length > 0 ? '✓ Valid' : '✗ Missing'}</li>
          <li>• Keep descriptions concise and clear</li>
        </ul>
      </div>
    </div>
  );
}


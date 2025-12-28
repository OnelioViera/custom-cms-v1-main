'use client';

import { Badge } from '@/components/ui/badge';
import { PageBlock } from '@/lib/models/Content';
import PageBlockRenderer from '@/components/public/PageBlockRenderer';

interface PagePreviewProps {
  page: {
    title: string;
    slug: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    status: 'draft' | 'published';
    showInNavbar?: boolean;
    blocks?: PageBlock[];
  };
}

export default function PagePreview({ page }: PagePreviewProps) {
  const displayTitle = page.metaTitle || page.title;
  const displayDescription = page.metaDescription || (page.content ? page.content.replace(/<[^>]*>/g, '').substring(0, 160) : '');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]">
        <div className="bg-gray-50 border-b px-4 py-3 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <p className="text-sm text-gray-600">How this page will appear</p>
        </div>

        {/* Page Preview - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {/* Render page blocks if available - no title banner */}
            {page.blocks && page.blocks.length > 0 ? (
              <PageBlockRenderer blocks={page.blocks} />
            ) : (
              <>
                <section className="bg-blue-900 text-white py-16">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <Badge variant="secondary" className={getStatusColor(page.status)}>
                        {page.status}
                      </Badge>
                      {page.showInNavbar && (
                        <Badge variant="outline" className="border-white text-white">
                          In Navbar
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-5xl font-bold">{page.title || 'Page Title'}</h1>
                  </div>
                </section>
                <section className="py-12">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm p-8">
                      {page.content ? (
                        <div 
                          className="prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                      ) : (
                        <div className="text-gray-500 text-center">
                          No content yet. Add content or page blocks to see preview.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-gray-50 border-t px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600">Slug</p>
              <p className="font-medium truncate">/{page.slug || 'page-slug'}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium capitalize">{page.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Navbar</p>
              <p className="font-medium">{page.showInNavbar ? 'Visible' : 'Hidden'}</p>
            </div>
            <div>
              <p className="text-gray-600">Blocks</p>
              <p className="font-medium">{page.blocks?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Tips */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 SEO Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Title length: {displayTitle?.length || 0}/60 characters</li>
          <li>• Description: {displayDescription?.length || 0}/160 characters</li>
          <li>• Slug: {page.slug?.length > 0 ? '✓ Valid' : '✗ Missing'}</li>
          <li>• Status: {page.status === 'published' ? '✓ Published' : '⚠ Draft'}</li>
          {page.showInNavbar && (
            <li>• ✓ Visible in navbar</li>
          )}
        </ul>
      </div>
    </div>
  );
}


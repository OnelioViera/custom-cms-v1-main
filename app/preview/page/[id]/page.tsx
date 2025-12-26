import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

async function getPreviewPage(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pages/preview/${id}`, {
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (!data.success) return null;
    return data.page;
  } catch (error) {
    console.error('Error fetching preview page:', error);
    return null;
  }
}

export default async function PreviewPagePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const page = await getPreviewPage(id);

  if (!page) {
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
            <span className="text-yellow-100">
              {page.status === 'draft' ? '(Draft)' : '(Published)'}
            </span>
          </div>
          <Link href={`/admin/pages/${page._id}`}>
            <Button variant="secondary" size="sm">
              <X className="w-4 h-4 mr-2" />
              Exit Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold">{page.title}</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';
import PageBlockRenderer from '@/components/public/PageBlockRenderer';
import { generateMetadata as generateMeta } from '@/lib/seo';
import type { Metadata } from 'next';

async function getAboutPage() {
  try {
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');
    
    const page = await pagesCollection.findOne({ 
      slug: 'about', 
      status: 'published' 
    });

    if (!page) return null;

    return {
      ...page,
      _id: page._id?.toString()
    };
  } catch (error) {
    console.error('Error fetching about page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();

  if (!page) {
    return {
      title: 'About Us',
    };
  }

  return generateMeta({
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.content.substring(0, 155),
    url: '/about',
    type: 'article',
    keywords: (page as { keywords?: string[] }).keywords || [],
  });
}

export default async function AboutPage() {
  const page = await getAboutPage();

  // If no page exists in CMS, show default content
  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-bold">About Us</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Create an "About" page in your CMS to display custom content here.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription || page.content.substring(0, 155),
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Render page blocks if available - no title banner */}
      {page.blocks && page.blocks.length > 0 ? (
        <PageBlockRenderer blocks={page.blocks} />
      ) : (
        <>
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
        </>
      )}
    </>
  );
}

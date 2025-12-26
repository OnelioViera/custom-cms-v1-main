import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold">{page.title}</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {page.content}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

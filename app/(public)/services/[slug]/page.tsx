import { getDatabase } from '@/lib/mongodb';
import { Service } from '@/lib/models/Content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getService(slug: string) {
  try {
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');
    
    const service = await servicesCollection.findOne({ slug });

    if (!service) {
      return null;
    }

    return {
      ...service,
      _id: service._id?.toString()
    };
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

async function getAllServices() {
  try {
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');
    
    const services = await servicesCollection
      .find({ status: 'active' })
      .sort({ order: 1 })
      .toArray();

    return services.map(s => ({
      ...s,
      _id: s._id?.toString()
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const service = await getService(resolvedParams.slug);

  if (!service) {
    notFound();
  }

  const allServices = await getAllServices();
  const otherServices = allServices.filter(s => s.slug !== service.slug);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/services"
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            {service.shortDescription}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {service.content && (
                <div className="prose max-w-none mb-8">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: service.content }}
                  />
                </div>
              )}

              {/* CTA Section */}
              <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to get started?
                </h2>
                <p className="text-gray-600 mb-6">
                  Contact us today to learn more about our {service.title.toLowerCase()} services.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Quick Contact</h3>
              <Link
                href="/contact"
                className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                Request a Quote
              </Link>
              <Link
                href="/projects"
                className="block w-full bg-gray-100 text-gray-700 text-center px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                View Our Work
              </Link>
            </div>

            {/* Other Services */}
            {otherServices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Other Services</h3>
                <div className="space-y-3">
                  {otherServices.slice(0, 5).map((s) => (
                    <Link
                      key={s._id}
                      href={`/services/${s.slug}`}
                      className="block text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

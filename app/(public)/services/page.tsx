import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { Service } from '@/lib/models/Content';

async function getServices() {
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

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Comprehensive precast concrete solutions for renewable energy infrastructure
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No services available at this time.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link 
                  key={service._id} 
                  href={`/services/${service.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all h-full">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {service.shortDescription}
                    </p>
                    <span className="text-blue-600 font-medium">
                      Learn more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We specialize in tailored precast solutions for unique project requirements.
          </p>
          <Link href="/contact">
            <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Contact Our Team
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

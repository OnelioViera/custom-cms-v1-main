import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDatabase } from '@/lib/mongodb';
import { Project, Customer } from '@/lib/models/Content';
import FeaturedProjectsCarousel from '@/components/public/FeaturedProjectsCarousel';
import CustomersCarousel from '@/components/public/CustomersCarousel';

async function getHomeData() {
  try {
    const db = await getDatabase();
    
    // Get settings
    const settingsCollection = db.collection('settings');
    const settings = await settingsCollection.findOne({ _id: 'homepage-hero' as any });
    const limit = settings?.featuredProjectsLimit || 3;
    const customersSettings = settings?.customers || {
      heading: 'Our Customers',
      description: 'Trusted by leading companies in renewable energy',
    };
    const hero = settings?.hero || {
      title: 'Building the Future of Renewable Energy Infrastructure',
      subtitle: 'Expert precast concrete solutions for utility-scale battery storage, solar installations, and critical infrastructure projects.',
      primaryButton: {
        enabled: true,
        text: 'View Our Projects',
        link: '/projects',
        backgroundColor: '#ffffff',
        textColor: '#1e40af',
      },
      secondaryButton: {
        enabled: true,
        text: 'Get in Touch',
        link: '/contact',
        backgroundColor: 'transparent',
        textColor: '#ffffff',
      },
      backgroundImage: '',
      backgroundVideo: '',
      backgroundType: 'color' as const,
      backgroundColor: '#1e40af',
      imageSettings: {
        opacity: 30,
        position: 'center' as const,
        scale: 100,
      },
    };
    
    // Get featured projects - Remove publishStatus filter
    const projectsCollection = db.collection<Project>('projects');
    const featuredProjects = await projectsCollection
      .find({ 
        featured: true, 
        status: { $in: ['in-progress' as const, 'completed' as const] }
      })
      .sort({ order: 1, updatedAt: -1 })
      .limit(limit)
      .toArray();

    // Get active services - Remove publishStatus filter
    // Get customers
    const customersCollection = db.collection<Customer>('customers');
    const customers = await customersCollection
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    const mappedProjects = featuredProjects.map(p => ({
      _id: p._id?.toString() || '',
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      client: p.client,
      status: p.status,
      featured: p.featured,
      images: Array.isArray(p.images) ? p.images : [],
      backgroundImage: p.backgroundImage || '',
      overlayColor: p.overlayColor,
      overlayOpacity: p.overlayOpacity,
      titleColor: p.titleColor,
      descriptionColor: p.descriptionColor,
    }));

    return {
      hero,
      projects: mappedProjects,
      customers: customers.map(c => ({
        ...c,
        _id: c._id?.toString()
      })),
      customersSettings,
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return { 
      hero: {
        title: 'Building the Future of Renewable Energy Infrastructure',
        subtitle: 'Expert precast concrete solutions for utility-scale battery storage, solar installations, and critical infrastructure projects.',
        primaryButton: {
          enabled: true,
          text: 'View Our Projects',
          link: '/projects',
          backgroundColor: '#ffffff',
          textColor: '#1e40af',
        },
        secondaryButton: {
          enabled: true,
          text: 'Get in Touch',
          link: '/contact',
          backgroundColor: 'transparent',
          textColor: '#ffffff',
        },
        backgroundImage: '',
        backgroundVideo: '',
        backgroundType: 'color' as const,
        backgroundColor: '#1e40af',
        imageSettings: {
          opacity: 30,
          position: 'center' as const,
          scale: 100,
        },
      },
      projects: [], 
      customers: [],
      customersSettings: {
        heading: 'Our Customers',
        description: 'Trusted by leading companies in renewable energy',
      },
    };
  }
}

export default async function HomePage() {
  const { hero, projects, customers, customersSettings } = await getHomeData();

  return (
    <main>
      {/* Hero Section - With Video Support */}
      <section 
        className="relative text-white overflow-hidden min-h-screen flex items-center"
        style={{ backgroundColor: hero.backgroundColor || '#1e40af' }}
      >
        {/* Background Video */}
        {hero.backgroundType === 'video' && hero.backgroundVideo && (
          <>
            <div className="absolute inset-0 w-full h-full">
            <video
              src={hero.backgroundVideo}
                className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
                style={{ 
                  opacity: (hero.imageSettings?.opacity || 30) / 100,
                }}
            />
          </div>
            {/* Color Overlay */}
            {(hero.imageSettings?.overlayColor && hero.imageSettings?.overlayOpacity) && (
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: hero.imageSettings.overlayColor,
                  opacity: (hero.imageSettings.overlayOpacity || 50) / 100,
                }}
              />
            )}
          </>
        )}

        {/* Background Image */}
        {hero.backgroundType === 'image' && hero.backgroundImage && (
          <>
          <div 
              className="absolute inset-0 w-full h-full"
          >
            <Image
              src={hero.backgroundImage}
              alt="Hero background"
              fill
              className={`object-cover ${
                hero.imageSettings?.position === 'top' ? 'object-top' :
                hero.imageSettings?.position === 'bottom' ? 'object-bottom' :
                'object-center'
              }`}
              style={{
                  opacity: (hero.imageSettings?.opacity || 30) / 100,
                transform: `scale(${(hero.imageSettings?.scale || 100) / 100})`,
              }}
              priority
                sizes="100vw"
            />
          </div>
            {/* Color Overlay */}
            {(hero.imageSettings?.overlayColor && hero.imageSettings?.overlayOpacity !== undefined) && (
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: hero.imageSettings.overlayColor,
                  opacity: (hero.imageSettings.overlayOpacity || 50) / 100,
                }}
              />
            )}
          </>
        )}
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              {hero.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {hero.subtitle}
            </p>
            
            {/* Dynamic Buttons */}
            <div className="flex flex-wrap gap-4">
              {hero.primaryButton?.enabled && (
                <Link href={hero.primaryButton.link}>
                  <Button 
                    size="lg" 
                    style={{
                      backgroundColor: hero.primaryButton.backgroundColor,
                      color: hero.primaryButton.textColor,
                      border: hero.primaryButton.backgroundColor === 'transparent' 
                        ? `2px solid ${hero.primaryButton.textColor}` 
                        : 'none',
                    }}
                    className="hover:opacity-90 transition-opacity"
                  >
                    {hero.primaryButton.text}
                  </Button>
                </Link>
              )}
              
              {hero.secondaryButton?.enabled && (
                <Link href={hero.secondaryButton.link}>
                  <Button 
                    size="lg"
                    variant="outline"
                    style={{
                      backgroundColor: hero.secondaryButton.backgroundColor,
                      color: hero.secondaryButton.textColor,
                      borderColor: hero.secondaryButton.textColor,
                    }}
                    className="hover:opacity-90 transition-opacity"
                  >
                    {hero.secondaryButton.text}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customers Section */}
      {customers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{customersSettings.heading}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {customersSettings.description}
              </p>
            </div>

            <CustomersCarousel 
              customers={customers}
              heading={customersSettings.heading}
              description={customersSettings.description}
            />
          </div>
        </section>
      )}

      {/* Featured Projects Carousel */}
      {projects.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
              <p className="text-xl text-gray-600">
                Powering the renewable energy revolution
              </p>
            </div>
            
            <FeaturedProjectsCarousel projects={projects} />

            <div className="text-center mt-12">
              <Link href="/projects">
                <Button variant="default" size="lg">
                  View All Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Partner with Lindsay Precast for reliable, high-quality precast solutions 
            for your renewable energy infrastructure.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="default" className="bg-white text-blue-900 hover:bg-blue-50">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

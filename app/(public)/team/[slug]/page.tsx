import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Linkedin } from 'lucide-react';
import { getDatabase } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models/Content';

async function getTeamMember(slug: string) {
  try {
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');
    
    const member = await teamCollection.findOne({ slug });

    if (!member) {
      return null;
    }

    return {
      ...member,
      _id: member._id?.toString()
    };
  } catch (error) {
    console.error('Error fetching team member:', error);
    return null;
  }
}

export default async function TeamMemberPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const member = await getTeamMember(slug);

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/team">
            <Button variant="ghost" className="text-white hover:text-blue-100 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            {member.image ? (
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 160px, 160px"
                />
              </div>
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-4 border-white/20">
                <span className="text-white text-4xl md:text-5xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{member.name}</h1>
              <p className="text-xl md:text-2xl text-blue-100">
                {member.role}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Member Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-8">
                {member.bio && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {member.email && (
                    <a 
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="break-all">{member.email}</span>
                    </a>
                  )}
                  {member.phone && (
                    <a 
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span>{member.phone}</span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


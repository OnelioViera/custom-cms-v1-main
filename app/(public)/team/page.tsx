import Image from 'next/image';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models/Content';

async function getTeamMembers() {
  try {
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');
    
    const members = await teamCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    return members.map(m => ({
      ...m,
      _id: m._id?.toString()
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Meet the experts behind Lindsay Precast's renewable energy solutions
          </p>
        </div>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No team members to display yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {members.map((member) => (
              <Link
                key={member._id}
                href={`/team/${member.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  {/* Photo */}
                  {member.image ? (
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <span className="text-white text-5xl font-bold">
                        {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

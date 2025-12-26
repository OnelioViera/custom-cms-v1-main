'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Plus, Search, Pencil } from 'lucide-react';
import Image from 'next/image';

interface TeamMember {
  _id: string;
  name: string;
  slug: string;
  role: string;
  photo?: string;
  email?: string;
  order: number;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/team');
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member: TeamMember) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading team members...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team</p>
        </div>
        <Link href="/admin/team/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Team Member
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No team members found matching your search.' : 'No team members yet. Add your first team member!'}
            </div>
          ) : (
            filteredMembers.map((member: TeamMember) => (
              <div
                key={member._id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {member.photo ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-gray-600 text-sm">{member.role}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Order: {member.order} • /team/{member.slug}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/team/${member._id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

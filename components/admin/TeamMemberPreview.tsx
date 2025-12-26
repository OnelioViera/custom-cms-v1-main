'use client';

import Image from 'next/image';
import { Mail, Phone, Linkedin } from 'lucide-react';

interface TeamMemberPreviewProps {
  member: {
    name: string;
    slug: string;
    role: string;
    bio?: string;
    photo?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };
}

export default function TeamMemberPreview({ member }: TeamMemberPreviewProps) {
  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <p className="text-sm text-gray-600">How this team member will appear</p>
        </div>

        {/* Card Preview */}
        <div className="p-4">
          <div className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
            {/* Photo */}
            {member.photo ? (
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {member.name ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name || 'Team Member Name'}
              </h3>
              <p className="text-sm text-blue-600 font-medium mb-3">
                {member.role || 'Role/Title'}
              </p>
              
              {member.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {member.bio}
                </p>
              )}
              
              {/* Contact Info */}
              <div className="space-y-2">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.linkedin && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Linkedin className="w-4 h-4" />
                    <span className="truncate">LinkedIn Profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-gray-50 border-t px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600">Slug</p>
              <p className="font-medium truncate">/team/{member.slug || 'member-slug'}</p>
            </div>
            <div>
              <p className="text-gray-600">Photo</p>
              <p className="font-medium">{member.photo ? '✓ Uploaded' : '✗ Missing'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Profile Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Name: {member.name?.length > 0 ? '✓' : '✗'} Required</li>
          <li>• Role: {member.role?.length > 0 ? '✓' : '✗'} Required</li>
          <li>• Photo: {member.photo ? '✓ Recommended' : '✗ Add a professional photo'}</li>
          <li>• Bio length: {member.bio?.length || 0}/300 characters</li>
        </ul>
      </div>
    </div>
  );
}


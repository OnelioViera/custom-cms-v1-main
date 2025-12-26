'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Save, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import SortableProjectsList from '@/components/admin/SortableProjectsList';

interface Project {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  status: string;
  featured: boolean;
  order: number;
  images?: string[];
  backgroundImage?: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.client?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects?includeAll=true');
      const data = await response.json();

      if (data.success) {
        // Sort by order, then by date
        const sorted = data.projects.sort((a: Project, b: Project) => {
          if (a.order && b.order) {
            return a.order - b.order;
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        
        // Assign order if missing
        const withOrder = sorted.map((p: Project, index: number) => ({
          ...p,
          order: p.order || index + 1,
        }));
        
        setProjects(withOrder);
        setFilteredProjects(withOrder);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (reorderedProjects: Project[]) => {
    setProjects(reorderedProjects);
    setHasChanges(true);
  };

  const handleSaveOrder = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: projects.map(p => ({ _id: p._id, order: p.order }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Project order saved successfully');
        setHasChanges(false);
      } else {
        toast.error(data.message || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your project portfolio - drag to reorder
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={handleSaveOrder} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Order'}
            </Button>
          )}
          <Link href="/admin/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <GripVertical className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-900 font-medium">
              Drag and drop to reorder projects
            </p>
            <p className="text-sm text-blue-700 mt-1">
              The order you set here will determine how featured projects appear on the homepage carousel.
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-600">
            {searchQuery ? 'No projects found matching your search.' : 'No projects yet.'}
          </p>
          {!searchQuery && (
            <Link href="/admin/projects/new">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <SortableProjectsList 
          projects={filteredProjects} 
          onReorder={handleReorder}
        />
      )}
    </div>
  );
}

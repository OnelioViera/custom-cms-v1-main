'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/pages/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setFormData({
          title: data.page.title,
          slug: data.page.slug,
          content: data.page.content || '',
          metaTitle: data.page.metaTitle || '',
          metaDescription: data.page.metaDescription || '',
          status: data.page.status,
        });
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const toastId = toast.loading('Saving page...');

    try {
      const response = await fetch(`/api/pages/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Page saved successfully', {
          id: toastId,
        });
        router.push('/admin/pages');
      } else {
        toast.error(data.message || 'Failed to save page', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page', {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: Ctrl+S to save
  const handleSaveShortcut = useCallback((e: KeyboardEvent) => {
    if (!saving) {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }
  }, [saving]);

  useKeyboardShortcut(
    { key: 's', ctrl: true, preventDefault: true },
    handleSaveShortcut,
    [saving]
  );

  // Keyboard shortcut: Escape to cancel
  useKeyboardShortcut(
    { key: 'Escape', preventDefault: false },
    () => {
      if (!saving) {
        router.push('/admin/pages');
      }
    },
    [saving, router]
  );

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/pages')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pages
        </Button>
        <h1 className="text-3xl font-bold">Edit Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-lg border p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          {/* SEO Section */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">SEO Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={3}
              />
              <p className="text-sm text-gray-500">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'published') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
              <span className="ml-2 text-xs opacity-60">Ctrl+S</span>
            </Button>
            <Link href={`/preview/page/${params.id}`} target="_blank">
              <Button type="button" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/pages')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { validateForm, validateField, slugify, ValidationErrors } from '@/lib/validation';
import ValidatedInput from '@/components/admin/ValidatedInput';
import ValidatedTextarea from '@/components/admin/ValidatedTextarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function NewPagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validationRules = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 200,
    },
    slug: {
      required: true,
      minLength: 3,
      maxLength: 200,
      pattern: /^[a-z0-9-]+$/,
      custom: (value: string) => {
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          return 'Slug can only contain lowercase letters, numbers, and hyphens';
        }
        return null;
      },
    },
    content: {
      required: true,
      minLength: 10,
    },
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Validate field in real-time
    const fieldRules = validationRules[field as keyof typeof validationRules];
    if (fieldRules) {
      const error = validateField(value, fieldRules, field);
      setErrors({ ...errors, [field]: error || '' });
    }
  };

  const handleTitleChange = (value: string) => {
    // Auto-generate slug from title if slug is empty or matches the old title
    const shouldAutoSlug = !formData.slug || formData.slug === slugify(formData.title);
    const newSlug = shouldAutoSlug ? slugify(value) : formData.slug;
    
    // Update form data
    setFormData({ ...formData, title: value, slug: newSlug });
    
    // Validate both fields
    const titleError = validateField(value, validationRules.title, 'title');
    const slugError = validateField(newSlug, validationRules.slug, 'slug');
    setErrors({ ...errors, title: titleError || '', slug: slugError || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entire form
    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);
    
    // Don't submit if there are errors
    if (Object.keys(formErrors).some(key => formErrors[key])) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setSaving(true);
    const toastId = toast.loading('Creating page...');

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Page created successfully', { id: toastId });
        router.push('/admin/pages');
      } else {
        toast.error(data.message || 'Failed to create page', { id: toastId });
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create page', { id: toastId });
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
        <h1 className="text-3xl font-bold">Create New Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-lg border p-6 space-y-6">
          {/* Title */}
          <ValidatedInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            error={errors.title}
            required
            placeholder="Enter page title"
          />

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/</span>
              <div className="flex-1">
                <ValidatedInput
                  label="URL Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={(value) => handleFieldChange('slug', value)}
                  error={errors.slug}
                  required
                  placeholder="page-url-slug"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => handleFieldChange('content', content)}
            />
            {errors.content && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                {errors.content}
              </p>
            )}
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

          {/* SEO Section */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-lg font-semibold">SEO Settings</h2>

            {/* Meta Title */}
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="SEO title for search engines"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="SEO description for search engines"
                rows={3}
              />
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).some(key => errors[key]) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Please fix the following errors:
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {Object.entries(errors)
                  .filter(([_, error]) => error)
                  .map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Creating...' : 'Create Page'}
              <span className="ml-2 text-xs opacity-60">Ctrl+S</span>
            </Button>
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

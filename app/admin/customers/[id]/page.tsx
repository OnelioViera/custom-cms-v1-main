'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
  });

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          name: data.customer.name,
          logo: data.customer.logo || '',
          website: data.customer.website || '',
        });
      } else {
        toast.error('Customer not found');
        router.push('/admin/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          logo: data.url,
        }));
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: '',
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Customer name is required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/customers/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Customer saved successfully');
      } else {
        toast.error(data.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/customers/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Customer deleted successfully');
        router.push('/admin/customers');
      } else {
        toast.error(data.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading customer...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-b sticky top-0 z-10 mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/customers">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Customer</h1>
              <p className="text-sm text-gray-600">{formData.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg border space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Company Name"
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <Label>Customer Logo *</Label>
            <div className="space-y-4 mt-2">
              {formData.logo && (
                <div className="relative w-full max-w-md bg-white border rounded-lg overflow-hidden group">
                  <div className="relative aspect-video flex items-center justify-center p-8">
                    <Image
                      src={formData.logo}
                      alt={formData.name || 'Customer logo'}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : formData.logo ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <p className="text-sm text-gray-500 mt-1">
                  Upload customer logo (Max 5MB). Recommended: PNG or SVG with transparent background
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


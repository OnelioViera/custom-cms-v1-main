'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
  });

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

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Customer name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Customer created successfully');
        router.push('/admin/customers');
      } else {
        toast.error(data.message || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold">New Customer</h1>
              <p className="text-sm text-gray-600">Add a new customer logo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Customer'}
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


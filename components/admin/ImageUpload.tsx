'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Edit } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropper from './ImageCropper';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: number;
  showEditButton?: boolean;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label = 'Image',
  aspectRatio = 1,
  showEditButton = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [cropperImage, setCropperImage] = useState<string | null>(null);

  // Sync preview with value prop when it changes
  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperImage(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', croppedBlob, 'cropped-image.jpg');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.url);
        onChange(data.url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.message || 'Upload failed');
        setPreview(value || '');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  const handleEditImage = async () => {
    if (!preview) return;
    
    try {
      // Load the current image and open it in the cropper
      const response = await fetch(preview);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperImage(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error loading image for editing:', error);
      toast.error('Failed to load image for editing');
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative group">
          <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain block"
              onError={() => toast.error('Failed to load image')}
            />
          </div>
          <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <Label htmlFor="image-upload-change" className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium shadow-lg">
                  Change Image
                </div>
              </Label>
              <Input
                id="image-upload-change"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          </div>
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {showEditButton && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="bg-white hover:bg-gray-100"
                onClick={handleEditImage}
                disabled={uploading}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700">
                <Upload className="w-4 h-4" />
                <span>Click to upload image</span>
              </div>
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      )}
      
      {uploading && (
        <p className="text-sm text-gray-600">Uploading...</p>
      )}

      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onComplete={handleCropComplete}
          onCancel={() => setCropperImage(null)}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  );
}

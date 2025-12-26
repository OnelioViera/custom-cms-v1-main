'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Upload, Check } from 'lucide-react';
import Image from 'next/image';

interface ImageEditorProps {
  currentImage?: string;
  onSave: (imageUrl: string, settings: ImageSettings) => void;
  onCancel: () => void;
}

export interface ImageSettings {
  opacity: number;
  position: 'center' | 'top' | 'bottom';
  scale: number;
}

export default function ImageEditor({ currentImage, onSave, onCancel }: ImageEditorProps) {
  const [uploadedImage, setUploadedImage] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<ImageSettings>({
    opacity: 30,
    position: 'center',
    scale: 100,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedImage(data.url);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (uploadedImage) {
      onSave(uploadedImage, settings);
    }
  };

  const getObjectPosition = () => {
    switch (settings.position) {
      case 'top':
        return 'object-top';
      case 'bottom':
        return 'object-bottom';
      default:
        return 'object-center';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold">Edit Hero Background</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Section */}
          {!uploadedImage && (
            <div>
              <Label>Upload Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-32"
              >
                <Upload className="w-6 h-6 mr-2" />
                {uploading ? 'Uploading...' : 'Choose Image'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Upload a high-resolution image (Max 10MB). Recommended: 1920x800px or larger.
              </p>
            </div>
          )}

          {/* Preview */}
          {uploadedImage && (
            <>
              <div>
                <Label>Preview</Label>
                <div className="relative h-96 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{ opacity: settings.opacity / 100 }}
                  >
                    <Image
                      src={uploadedImage}
                      alt="Hero background preview"
                      fill
                      className={`object-cover ${getObjectPosition()}`}
                      style={{
                        transform: `scale(${settings.scale / 100})`,
                      }}
                    />
                  </div>
                  {/* Sample text overlay */}
                  <div className="relative h-full flex items-center justify-center">
                    <div className="text-white text-center p-8">
                      <h1 className="text-4xl font-bold mb-4">Sample Hero Title</h1>
                      <p className="text-xl">Sample subtitle text that will appear on the hero section</p>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUploadedImage('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </div>

              {/* Controls */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">Image Settings</h3>

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Image Opacity</Label>
                    <span className="text-sm text-gray-600">{settings.opacity}%</span>
                  </div>
                  <Slider
                    value={[settings.opacity]}
                    onValueChange={(value) => setSettings({ ...settings, opacity: value[0] })}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Lower opacity makes text more readable
                  </p>
                </div>

                {/* Position */}
                <div>
                  <Label className="mb-2 block">Image Position</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'center', 'bottom'] as const).map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => setSettings({ ...settings, position })}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          settings.position === position
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {position.charAt(0).toUpperCase() + position.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose which part of the image to focus on
                  </p>
                </div>

                {/* Scale */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Image Scale</Label>
                    <span className="text-sm text-gray-600">{settings.scale}%</span>
                  </div>
                  <Slider
                    value={[settings.scale]}
                    onValueChange={(value) => setSettings({ ...settings, scale: value[0] })}
                    min={80}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Zoom in or out to fit the image better
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex gap-4 justify-end sticky bottom-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!uploadedImage}
          >
            <Check className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}


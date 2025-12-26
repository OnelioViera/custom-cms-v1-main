'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Edit, X, Upload, Save } from 'lucide-react';
import Image from 'next/image';
import ImageEditor, { ImageSettings } from '@/components/admin/ImageEditor';
import HeroPreview from '@/components/admin/HeroPreview';

interface Page {
  value: string;
  label: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [settings, setSettings] = useState({
    featuredProjectsLimit: 3,
    hero: {
      title: '',
      subtitle: '',
      primaryButton: {
        enabled: true,
        text: '',
        link: '',
        backgroundColor: '#ffffff',
        textColor: '#1e40af',
      },
      secondaryButton: {
        enabled: true,
        text: '',
        link: '',
        backgroundColor: 'transparent',
        textColor: '#ffffff',
      },
      backgroundImage: '',
      backgroundVideo: '',
      backgroundType: 'color' as 'color' | 'image' | 'video',
      backgroundColor: '#1e40af',
      imageSettings: {
        opacity: 30,
        position: 'center' as 'center' | 'top' | 'bottom',
        scale: 100,
      },
    },
  });

  useEffect(() => {
    fetchSettings();
    fetchPages();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        const mergedSettings = {
          featuredProjectsLimit: data.settings.featuredProjectsLimit || 3,
          hero: {
            title: data.settings.hero?.title || '',
            subtitle: data.settings.hero?.subtitle || '',
            primaryButton: {
              enabled: data.settings.hero?.primaryButton?.enabled ?? true,
              text: data.settings.hero?.primaryButton?.text || data.settings.hero?.primaryButtonText || 'View Our Projects',
              link: data.settings.hero?.primaryButton?.link || data.settings.hero?.primaryButtonLink || '/projects',
              backgroundColor: data.settings.hero?.primaryButton?.backgroundColor || '#ffffff',
              textColor: data.settings.hero?.primaryButton?.textColor || '#1e40af',
            },
            secondaryButton: {
              enabled: data.settings.hero?.secondaryButton?.enabled ?? true,
              text: data.settings.hero?.secondaryButton?.text || data.settings.hero?.secondaryButtonText || 'Get in Touch',
              link: data.settings.hero?.secondaryButton?.link || data.settings.hero?.secondaryButtonLink || '/contact',
              backgroundColor: data.settings.hero?.secondaryButton?.backgroundColor || 'transparent',
              textColor: data.settings.hero?.secondaryButton?.textColor || '#ffffff',
            },
            backgroundImage: data.settings.hero?.backgroundImage || '',
            backgroundVideo: data.settings.hero?.backgroundVideo || '',
            backgroundType: data.settings.hero?.backgroundType || 'color',
            backgroundColor: data.settings.hero?.backgroundColor || '#1e40af',
            imageSettings: {
              opacity: data.settings.hero?.imageSettings?.opacity ?? 30,
              position: data.settings.hero?.imageSettings?.position || 'center',
              scale: data.settings.hero?.imageSettings?.scale ?? 100,
            },
          },
        };
        
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const data = await response.json();
      
      if (data.success) {
        setAvailablePages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handleImageSave = (imageUrl: string, imageSettings: ImageSettings) => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgroundImage: imageUrl,
        imageSettings: {
          ...imageSettings,
          position: imageSettings.position as 'center' | 'top' | 'bottom',
        },
      },
    }));
    setShowImageEditor(false);
    toast.success('Hero background updated');
  };

  const removeHeroImage = () => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgroundImage: '',
      },
    }));
    toast.success('Hero background removed');
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be less than 50MB');
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
        setSettings(prev => ({
          ...prev,
          hero: {
            ...prev.hero,
            backgroundVideo: data.url,
          },
        }));
        toast.success('Video uploaded successfully');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const removeHeroVideo = () => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgroundVideo: '',
      },
    }));
    toast.success('Video removed');
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      console.log('Submitting settings:', settings);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully');
        await fetchSettings();
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getObjectPosition = () => {
    switch (settings.hero.imageSettings?.position) {
      case 'top':
        return 'object-top';
      case 'bottom':
        return 'object-bottom';
      default:
        return 'object-center';
    }
  };

  // Dynamic styles for user-generated values
  const backgroundImageContainerStyle: React.CSSProperties = {
    backgroundColor: settings.hero.backgroundColor,
  };
  
  const backgroundImageOverlayStyle: React.CSSProperties = {
    opacity: (settings.hero.imageSettings?.opacity || 30) / 100,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Action Bar */}
      <div className="bg-white border-b sticky top-0 z-10 mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Settings className="w-6 h-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-gray-600">Configure homepage and site settings</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section Settings */}
          <div className="bg-white p-6 rounded-lg border space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
              
              {/* Title */}
              <div className="mb-4">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={settings.hero.title}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    hero: { ...settings.hero, title: e.target.value }
                  })}
                  placeholder="Building the Future of..."
                />
              </div>

              {/* Subtitle */}
              <div className="mb-6">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={settings.hero.subtitle}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    hero: { ...settings.hero, subtitle: e.target.value }
                  })}
                  rows={3}
                  placeholder="Expert precast concrete solutions..."
                />
              </div>

              {/* Primary Button */}
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Primary Button</h3>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.hero.primaryButton.enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        hero: {
                          ...settings.hero,
                          primaryButton: { ...settings.hero.primaryButton, enabled: checked }
                        }
                      })}
                    />
                    <Label>Enabled</Label>
                  </div>
                </div>

                {settings.hero.primaryButton.enabled && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryButtonText">Button Text</Label>
                        <Input
                          id="primaryButtonText"
                          value={settings.hero.primaryButton.text}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              primaryButton: { ...settings.hero.primaryButton, text: e.target.value }
                            }
                          })}
                          placeholder="View Our Projects"
                        />
                      </div>
                      <div>
                        <Label htmlFor="primaryButtonLink">Button Link</Label>
                        <select
                          id="primaryButtonLink"
                          value={settings.hero.primaryButton.link}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              primaryButton: { ...settings.hero.primaryButton, link: e.target.value }
                            }
                          })}
                          className="w-full border rounded-md px-3 py-2"
                          aria-label="Select page for primary button link"
                        >
                          {availablePages.map((page) => (
                            <option key={page.value} value={page.value}>
                              {page.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryButtonBg">Background Color</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={settings.hero.primaryButton.backgroundColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                primaryButton: { ...settings.hero.primaryButton, backgroundColor: e.target.value }
                              }
                            })}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={settings.hero.primaryButton.backgroundColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                primaryButton: { ...settings.hero.primaryButton, backgroundColor: e.target.value }
                              }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="primaryButtonText">Text Color</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={settings.hero.primaryButton.textColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                primaryButton: { ...settings.hero.primaryButton, textColor: e.target.value }
                              }
                            })}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={settings.hero.primaryButton.textColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                primaryButton: { ...settings.hero.primaryButton, textColor: e.target.value }
                              }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Button */}
              <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Secondary Button</h3>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.hero.secondaryButton.enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        hero: {
                          ...settings.hero,
                          secondaryButton: { ...settings.hero.secondaryButton, enabled: checked }
                        }
                      })}
                    />
                    <Label>Enabled</Label>
                  </div>
                </div>

                {settings.hero.secondaryButton.enabled && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="secondaryButtonText">Button Text</Label>
                        <Input
                          id="secondaryButtonText"
                          value={settings.hero.secondaryButton.text}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              secondaryButton: { ...settings.hero.secondaryButton, text: e.target.value }
                            }
                          })}
                          placeholder="Get in Touch"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondaryButtonLink">Button Link</Label>
                        <select
                          id="secondaryButtonLink"
                          value={settings.hero.secondaryButton.link}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              secondaryButton: { ...settings.hero.secondaryButton, link: e.target.value }
                            }
                          })}
                          className="w-full border rounded-md px-3 py-2"
                          aria-label="Select page for secondary button link"
                        >
                          {availablePages.map((page) => (
                            <option key={page.value} value={page.value}>
                              {page.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="secondaryButtonBg">Background Color</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={settings.hero.secondaryButton.backgroundColor === 'transparent' ? '#000000' : settings.hero.secondaryButton.backgroundColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                secondaryButton: { ...settings.hero.secondaryButton, backgroundColor: e.target.value }
                              }
                            })}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={settings.hero.secondaryButton.backgroundColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                secondaryButton: { ...settings.hero.secondaryButton, backgroundColor: e.target.value }
                              }
                            })}
                            placeholder="transparent or #hex"
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Use &quot;transparent&quot; for no background</p>
                      </div>
                      <div>
                        <Label htmlFor="secondaryButtonTextColor">Text Color</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={settings.hero.secondaryButton.textColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                secondaryButton: { ...settings.hero.secondaryButton, textColor: e.target.value }
                              }
                            })}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={settings.hero.secondaryButton.textColor}
                            onChange={(e) => setSettings({
                              ...settings,
                              hero: {
                                ...settings.hero,
                                secondaryButton: { ...settings.hero.secondaryButton, textColor: e.target.value }
                              }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Color */}
              <div className="mb-6">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={settings.hero.backgroundColor}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      hero: { ...settings.hero, backgroundColor: e.target.value }
                    })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.hero.backgroundColor}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      hero: { ...settings.hero, backgroundColor: e.target.value }
                    })}
                    placeholder="#1e40af"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the background color for the hero section
                </p>
              </div>

              {/* Background Type Selector */}
              <div className="mb-6">
                <Label>Background Type</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['color', 'image', 'video'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        hero: { ...settings.hero, backgroundType: type }
                      })}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        settings.hero.backgroundType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Choose background type: solid color, image, or video
                </p>
              </div>

              {/* Background Image Upload - Show only if type is 'image' */}
              {settings.hero.backgroundType === 'image' && (
                <div className="mb-6">
                  <Label>Hero Background Image</Label>
                  <div className="space-y-4">
                    {settings.hero.backgroundImage && (
                      <div 
                        className="relative h-64 rounded-lg overflow-hidden border group"
                        style={backgroundImageContainerStyle}
                      >
                        <div 
                          className="absolute inset-0"
                          style={backgroundImageOverlayStyle}
                        >
                          <Image
                            src={settings.hero.backgroundImage}
                            alt="Hero background"
                            fill
                            className={`object-cover ${getObjectPosition()}`}
                            style={{
                              transform: `scale(${(settings.hero.imageSettings?.scale || 100) / 100})`,
                            }}
                          />
                          
                        </div>
                        <div className="relative h-full flex items-center justify-center text-white">
                          <div className="text-center p-8">
                            <h3 className="text-2xl font-bold">Preview</h3>
                            <p className="text-sm">Opacity: {settings.hero.imageSettings?.opacity}% | Position: {settings.hero.imageSettings?.position} | Scale: {settings.hero.imageSettings?.scale}%</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeHeroImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove hero background image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowImageEditor(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {settings.hero.backgroundImage ? 'Edit Background' : 'Add Background'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload and customize the hero background image
                    </p>
                  </div>
                </div>
              )}

              {/* Background Video Upload - Show only if type is 'video' */}
              {settings.hero.backgroundType === 'video' && (
                <div className="mb-6">
                  <Label>Hero Background Video</Label>
                  <div className="space-y-4">
                    {settings.hero.backgroundVideo && (
                      <div className="relative h-64 rounded-lg overflow-hidden border bg-black group">
                        <video
                          src={settings.hero.backgroundVideo}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="text-white text-center">
                            <p className="text-sm">Video Preview (Opacity: {settings.hero.imageSettings?.opacity || 30}%)</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeHeroVideo}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove hero background video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div>
                      <input
                        type="file"
                        id="video-upload"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        aria-label="Upload hero background video"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('video-upload')?.click()}
                        disabled={uploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : settings.hero.backgroundVideo ? 'Change Video' : 'Upload Video'}
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload background video (Max 50MB). Recommended: MP4 format, 1920x1080
                      </p>
                    </div>

                    {/* Opacity control for video */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Video Opacity</Label>
                        <span className="text-sm text-gray-600">{settings.hero.imageSettings?.opacity || 30}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={settings.hero.imageSettings?.opacity || 30}
                        onChange={(e) => setSettings({
                          ...settings,
                          hero: {
                            ...settings.hero,
                            imageSettings: {
                              ...settings.hero.imageSettings,
                              opacity: parseInt(e.target.value),
                              position: settings.hero.imageSettings?.position || 'center',
                              scale: settings.hero.imageSettings?.scale || 100,
                            }
                          }
                        })}
                        className="w-full"
                        aria-label="Video opacity control"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Control video transparency (lower = more visible text)
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Homepage Settings */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Homepage Settings</h2>
            <div>
              <Label htmlFor="featuredProjectsLimit">
                Number of Featured Projects to Display
              </Label>
              <Input
                id="featuredProjectsLimit"
                type="number"
                min="1"
                max="12"
                value={settings.featuredProjectsLimit}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  featuredProjectsLimit: parseInt(e.target.value) || 3 
                })}
              />
              <p className="text-sm text-gray-500 mt-1">
                How many featured projects to show in the carousel (1-12)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <HeroPreview settings={settings} />
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <ImageEditor
          currentImage={settings.hero.backgroundImage}
          onSave={handleImageSave}
          onCancel={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
}

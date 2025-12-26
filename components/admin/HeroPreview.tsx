'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroPreviewProps {
  settings: {
    hero: {
      title: string;
      subtitle: string;
      primaryButton: {
        enabled: boolean;
        text: string;
        backgroundColor: string;
        textColor: string;
      };
      secondaryButton: {
        enabled: boolean;
        text: string;
        backgroundColor: string;
        textColor: string;
      };
      backgroundImage?: string;
      backgroundVideo?: string;
      backgroundType?: 'color' | 'image' | 'video';
      backgroundColor?: string;
      imageSettings?: {
        opacity: number;
        position: 'center' | 'top' | 'bottom';
        scale: number;
      };
    };
  };
}

export default function HeroPreview({ settings }: HeroPreviewProps) {
  const { hero } = settings;

  const getObjectPosition = () => {
    switch (hero.imageSettings?.position) {
      case 'top':
        return 'object-top';
      case 'bottom':
        return 'object-bottom';
      default:
        return 'object-center';
    }
  };

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          <p className="text-sm text-gray-600">See your changes in real-time</p>
        </div>

        {/* Mini Hero Preview */}
        <div 
          className="relative h-96 overflow-hidden"
          style={{ backgroundColor: hero.backgroundColor || '#1e40af' }}
        >
          {/* Background Video */}
          {hero.backgroundType === 'video' && hero.backgroundVideo && (
            <div className="absolute inset-0">
              <video
                src={hero.backgroundVideo}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                style={{ opacity: (hero.imageSettings?.opacity || 30) / 100 }}
              />
            </div>
          )}

          {/* Background Image */}
          {hero.backgroundType === 'image' && hero.backgroundImage && (
            <div 
              className="absolute inset-0"
              style={{ opacity: (hero.imageSettings?.opacity || 30) / 100 }}
            >
              <Image
                src={hero.backgroundImage}
                alt="Hero background"
                fill
                className={`object-cover ${getObjectPosition()}`}
                style={{
                  transform: `scale(${(hero.imageSettings?.scale || 100) / 100})`,
                }}
              />
            </div>
          )}
          
          {/* Content */}
          <div className="relative h-full flex items-center p-8">
            <div className="max-w-full">
              <h1 className="text-3xl font-bold mb-3 text-white line-clamp-2">
                {hero.title || 'Your Hero Title'}
              </h1>
              <p className="text-sm mb-4 text-white/90 line-clamp-2">
                {hero.subtitle || 'Your hero subtitle goes here'}
              </p>
              
              {/* Buttons */}
              <div className="flex flex-wrap gap-2">
                {hero.primaryButton?.enabled && (
                  <Button 
                    size="sm"
                    style={{
                      backgroundColor: hero.primaryButton.backgroundColor,
                      color: hero.primaryButton.textColor,
                      border: hero.primaryButton.backgroundColor === 'transparent' 
                        ? `2px solid ${hero.primaryButton.textColor}` 
                        : 'none',
                    }}
                  >
                    {hero.primaryButton.text || 'Primary Button'}
                  </Button>
                )}
                
                {hero.secondaryButton?.enabled && (
                  <Button 
                    size="sm"
                    variant="outline"
                    style={{
                      backgroundColor: hero.secondaryButton.backgroundColor,
                      color: hero.secondaryButton.textColor,
                      borderColor: hero.secondaryButton.textColor,
                    }}
                  >
                    {hero.secondaryButton.text || 'Secondary Button'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-gray-50 border-t px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600">Background Type</p>
              <p className="font-medium capitalize">{hero.backgroundType || 'color'}</p>
            </div>
            {(hero.backgroundType === 'image' || hero.backgroundType === 'video') && (
              <div>
                <p className="text-gray-600">Opacity</p>
                <p className="font-medium">{hero.imageSettings?.opacity || 30}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Keep titles under 60 characters</li>
          <li>• Use contrasting button colors</li>
          <li>• Lower opacity for better text readability</li>
          <li>• Test on mobile devices</li>
        </ul>
      </div>
    </div>
  );
}


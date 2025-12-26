import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

interface SiteSettings {
  _id: string;
  featuredProjectsLimit: number;
  hero: {
    title: string;
    subtitle: string;
    primaryButton: {
      enabled: boolean;
      text: string;
      link: string;
      backgroundColor: string;
      textColor: string;
    };
    secondaryButton: {
      enabled: boolean;
      text: string;
      link: string;
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
  updatedAt?: Date;
}

// GET settings
export async function GET() {
  try {
    const db = await getDatabase();
    const settingsCollection = db.collection<SiteSettings>('settings');
    
    let settings = await settingsCollection.findOne({ _id: 'homepage-hero' as any });
    
    if (!settings) {
      const defaultSettings: SiteSettings = {
        _id: 'homepage-hero',
        featuredProjectsLimit: 3,
        hero: {
          title: 'Building the Future of Renewable Energy Infrastructure',
          subtitle: 'Expert precast concrete solutions for utility-scale battery storage, solar installations, and critical infrastructure projects.',
          primaryButton: {
            enabled: true,
            text: 'View Our Projects',
            link: '/projects',
            backgroundColor: '#ffffff',
            textColor: '#1e40af',
          },
          secondaryButton: {
            enabled: true,
            text: 'Get in Touch',
            link: '/contact',
            backgroundColor: 'transparent',
            textColor: '#ffffff',
          },
          backgroundImage: '',
          backgroundVideo: '',
          backgroundType: 'color',
          backgroundColor: '#1e40af',
          imageSettings: {
            opacity: 30,
            position: 'center',
            scale: 100,
          },
        },
      };
      
      return NextResponse.json({
        success: true,
        settings: defaultSettings,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT update settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    const settingsCollection = db.collection<SiteSettings>('settings');

    console.log('Saving settings:', JSON.stringify(data, null, 2));

    const updateData: any = {
      featuredProjectsLimit: data.featuredProjectsLimit || 3,
      updatedAt: new Date(),
    };

    if (data.hero) {
      updateData.hero = {
        title: data.hero.title || '',
        subtitle: data.hero.subtitle || '',
        primaryButton: {
          enabled: data.hero.primaryButton?.enabled ?? true,
          text: data.hero.primaryButton?.text || 'View Our Projects',
          link: data.hero.primaryButton?.link || '/projects',
          backgroundColor: data.hero.primaryButton?.backgroundColor || '#ffffff',
          textColor: data.hero.primaryButton?.textColor || '#1e40af',
        },
        secondaryButton: {
          enabled: data.hero.secondaryButton?.enabled ?? true,
          text: data.hero.secondaryButton?.text || 'Get in Touch',
          link: data.hero.secondaryButton?.link || '/contact',
          backgroundColor: data.hero.secondaryButton?.backgroundColor || 'transparent',
          textColor: data.hero.secondaryButton?.textColor || '#ffffff',
        },
        backgroundImage: data.hero.backgroundImage || '',
        backgroundVideo: data.hero.backgroundVideo || '',
        backgroundType: data.hero.backgroundType || 'color',
        backgroundColor: data.hero.backgroundColor || '#1e40af',
        imageSettings: {
          opacity: data.hero.imageSettings?.opacity ?? 30,
          position: data.hero.imageSettings?.position || 'center',
          scale: data.hero.imageSettings?.scale ?? 100,
        },
      };
    }

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    await settingsCollection.updateOne(
      { _id: 'homepage-hero' as any },
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

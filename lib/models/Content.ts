// Content models for CMS - Updated with Project content field

import { ObjectId } from 'mongodb';

// Page Model
export interface Page {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Project Model
export interface Project {
  _id?: ObjectId;
  title: string;
  slug: string;
  description: string;
  content?: string;
  images?: string[];
  backgroundImage?: string;
  client?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'planning' | 'in-progress' | 'completed';
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Team Member Model
export interface TeamMember {
  _id?: ObjectId;
  name: string;
  slug: string;
  role: string;
  bio?: string;
  image?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Service Model
export interface Service {
  _id?: ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  content?: string;
  icon?: string;
  status: 'active' | 'inactive';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Media Model
export interface Media {
  _id?: ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  title?: string;
  folder?: string;
  uploadedBy: string;
  createdAt: Date;
}

// Settings Model
export interface SiteSettings {
  _id?: ObjectId;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
  };
  updatedAt: Date;
  updatedBy: string;
}

import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  keywords?: string[];
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    image = '/default-og-image.jpg',
    url = process.env.NEXT_PUBLIC_APP_URL || 'https://custom-cms-v1.vercel.app',
    type = 'website',
    publishedTime,
    author,
    keywords = [],
  } = config;

  const fullTitle = `${title} | Lindsay Precast`;
  const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_APP_URL}${url}`;
  const imageUrl = image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_APP_URL}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'Lindsay Precast',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type,
      ...(publishedTime && type === 'article' ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export function generateJSONLD(data: Record<string, unknown>) {
  return {
    '@context': 'https://schema.org',
    ...data,
  };
}

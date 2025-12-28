import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { headers } from 'next/headers';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Lindsay Precast | Precast Concrete Solutions',
    template: '%s | Lindsay Precast',
  },
  description: 'Professional precast concrete manufacturing and solutions. Specializing in manholes, wet wells, storm drain inlets, and custom concrete products.',
  keywords: ['precast concrete', 'concrete manufacturing', 'manholes', 'wet wells', 'storm drain', 'concrete solutions'],
  authors: [{ name: 'Lindsay Precast' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Lindsay Precast',
    title: 'Lindsay Precast | Precast Concrete Solutions',
    description: 'Professional precast concrete manufacturing and solutions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lindsay Precast | Precast Concrete Solutions',
    description: 'Professional precast concrete manufacturing and solutions.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Always apply base body class - LayoutWrapper will handle conditional layout on client
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Toaster position="top-right" />
        <ErrorBoundary>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}

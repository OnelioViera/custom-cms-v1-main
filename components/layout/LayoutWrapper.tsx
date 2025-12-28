'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't show header/footer on admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isPreviewRoute = pathname.startsWith('/preview');
  const shouldShowLayout = !isAdminRoute && !isPreviewRoute;

  // Update body class based on route
  useEffect(() => {
    const body = document.body;
    if (shouldShowLayout) {
      body.classList.add('min-h-screen', 'flex', 'flex-col');
    } else {
      body.classList.remove('min-h-screen', 'flex', 'flex-col');
    }
  }, [shouldShowLayout]);

  return (
    <>
      {shouldShowLayout && <Header />}
      <main className={shouldShowLayout ? 'flex-grow' : ''}>
        {children}
      </main>
      {shouldShowLayout && <Footer />}
    </>
  );
}


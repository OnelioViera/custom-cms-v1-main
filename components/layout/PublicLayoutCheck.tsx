'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function PublicLayoutCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show header/footer on admin pages
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

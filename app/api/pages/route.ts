import { NextResponse } from 'next/server';

export async function GET() {
  // Define available pages in your site
  const pages = [
    { value: '/', label: 'Home' },
    { value: '/about', label: 'About Us' },
    { value: '/services', label: 'Services' },
    { value: '/projects', label: 'Projects' },
    { value: '/team', label: 'Team' },
    { value: '/contact', label: 'Contact Us' },
  ];

  return NextResponse.json({
    success: true,
    pages,
  });
}

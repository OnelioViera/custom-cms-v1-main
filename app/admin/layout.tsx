'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import CommandPalette from '@/components/admin/CommandPalette';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Users, 
  Wrench,
  Image,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K for command palette
  useKeyboardShortcut(
    { key: 'k', ctrl: true, preventDefault: true },
    () => setCommandPaletteOpen(true),
    []
  );

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Projects', href: '/admin/projects', icon: Briefcase },
    { name: 'Team Members', href: '/admin/team', icon: Users },
    { name: 'Services', href: '/admin/services', icon: Wrench },
    { name: 'Media', href: '/admin/media', icon: Image },
    { name: 'Monitoring', href: '/admin/monitoring', icon: Activity },
    { name: 'Config', href: '/admin/config', icon: Settings },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold">CMS Admin</h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">{user.name}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <CommandPalette 
        open={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
      <Toaster />
    </AuthProvider>
  );
}

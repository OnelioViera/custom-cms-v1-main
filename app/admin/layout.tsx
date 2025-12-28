'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
  sidebarCollapsed: boolean;
  hoveredItem: string | null;
  onMouseEnter: (name: string) => void;
  onMouseLeave: () => void;
}

function NavItem({ item, isActive, sidebarCollapsed, hoveredItem, onMouseEnter, onMouseLeave }: NavItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  const handleMouseEnter = useCallback(() => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
    }
    onMouseEnter(item.name);
  }, [item.name, onMouseEnter]);

  const Icon = item.icon;
  const isHovered = hoveredItem === item.name;

  return (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-50'
        } ${sidebarCollapsed ? 'justify-center' : ''}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!sidebarCollapsed && <span>{item.name}</span>}
      </Link>
      
      {/* Tooltip - Show when collapsed */}
      {sidebarCollapsed && isHovered && (
        <div 
          className="fixed pointer-events-none" 
          style={{ 
            zIndex: 9999,
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="relative bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-8 border-r-gray-900 border-b-4 border-b-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
    { name: 'Customers', href: '/admin/customers', icon: Users },
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
      <div 
        className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{ zIndex: 1000 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className={`border-b border-gray-200 flex items-center ${sidebarCollapsed ? 'justify-center p-4' : 'justify-between p-6'}`}>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">CMS Admin</h1>
                {user && (
                  <p className="text-sm text-gray-600 mt-1">{user.name}</p>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={sidebarCollapsed ? '' : 'ml-auto'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  sidebarCollapsed={sidebarCollapsed}
                  hoveredItem={hoveredItem}
                  onMouseEnter={(name) => setHoveredItem(name)}
                  onMouseLeave={() => setHoveredItem(null)}
                />
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'}`}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
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

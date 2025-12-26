'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  FolderKanban, 
  Users, 
  Briefcase,
  Settings,
  Search,
  Home
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <Home className="w-4 h-4" />,
      action: () => router.push('/admin/dashboard'),
      keywords: ['home', 'dashboard'],
    },
    {
      id: 'pages',
      label: 'Go to Pages',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/admin/pages'),
      keywords: ['pages', 'content'],
    },
    {
      id: 'projects',
      label: 'Go to Projects',
      icon: <FolderKanban className="w-4 h-4" />,
      action: () => router.push('/admin/projects'),
      keywords: ['projects', 'portfolio'],
    },
    {
      id: 'team',
      label: 'Go to Team',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/admin/team'),
      keywords: ['team', 'members', 'people'],
    },
    {
      id: 'services',
      label: 'Go to Services',
      icon: <Briefcase className="w-4 h-4" />,
      action: () => router.push('/admin/services'),
      keywords: ['services', 'offerings'],
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/admin/settings'),
      keywords: ['settings', 'config', 'configuration'],
    },
    {
      id: 'new-page',
      label: 'Create New Page',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/admin/pages/new'),
      keywords: ['new', 'create', 'page'],
    },
    {
      id: 'new-project',
      label: 'Create New Project',
      icon: <FolderKanban className="w-4 h-4" />,
      action: () => router.push('/admin/projects/new'),
      keywords: ['new', 'create', 'project'],
    },
    {
      id: 'new-team',
      label: 'Add Team Member',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/admin/team/new'),
      keywords: ['new', 'add', 'team', 'member'],
    },
    {
      id: 'new-service',
      label: 'Create New Service',
      icon: <Briefcase className="w-4 h-4" />,
      action: () => router.push('/admin/services/new'),
      keywords: ['new', 'create', 'service'],
    },
  ];

  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.keywords.some((keyword) => keyword.includes(searchLower))
    );
  });

  const handleSelect = (command: Command) => {
    command.action();
    onClose();
    setSearch('');
  };

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            autoFocus
          />
          <kbd className="ml-auto px-2 py-1 text-xs bg-gray-100 rounded border">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => handleSelect(command)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="text-gray-600">{command.icon}</div>
                  <span className="text-sm font-medium">{command.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Use ↑↓ to navigate</span>
          <span>Press Enter to select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

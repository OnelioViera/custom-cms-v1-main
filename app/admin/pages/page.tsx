'use client';

import { useState, useEffect, useMemo } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Page } from '@/lib/models/Content';
import SearchInput from '@/components/admin/SearchInput';
import Pagination from '@/components/admin/Pagination';
import TableSkeleton from '@/components/admin/skeletons/TableSkeleton';
import { undoManager } from '@/lib/undoManager';
import ExportImport from '@/components/admin/ExportImport';

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const data = await response.json();
      if (data.success) {
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // Find the page before deleting
    const pageToDelete = pages.find(p => p._id?.toString() === deleteId);

    try {
      const response = await fetch(`/api/pages/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Store for undo
        if (pageToDelete) {
          undoManager.addDeleteAction('pages', [pageToDelete]);
        }

        toast.success('Page deleted successfully', {
          action: pageToDelete ? {
            label: 'Undo',
            onClick: () => handleUndoDelete(),
          } : undefined,
        });
        fetchPages();
      } else {
        toast.error(data.message || 'Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    } finally {
      setDeleteId(null);
    }
  };

  const handleUndoDelete = async () => {
    const lastAction = undoManager.getLastAction();
    
    if (!lastAction || lastAction.collection !== 'pages') {
      toast.error('Nothing to undo');
      return;
    }

    try {
      const page = lastAction.items[0];
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });

      const data = await response.json();

      if (data.success) {
        undoManager.removeLastAction();
        toast.success('Page restored');
        fetchPages();
      } else {
        toast.error('Failed to restore page');
      }
    } catch (error) {
      console.error('Undo error:', error);
      toast.error('Failed to restore page');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedPages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedPages.map(page => page._id?.toString() || '').filter(Boolean));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    // Store pages before deleting
    const pagesToDelete = pages.filter(p => selectedIds.includes(p._id?.toString() || ''));

    setBulkActionLoading(true);
    setBulkDeleteConfirm(false);

    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/pages/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      // Store for undo
      undoManager.addDeleteAction('pages', pagesToDelete);
      
      toast.success(`Successfully deleted ${selectedIds.length} page(s)`, {
        action: {
          label: 'Undo',
          onClick: () => handleUndoBulkDelete(pagesToDelete),
        },
      });
      setSelectedIds([]);
      fetchPages();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some pages');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleUndoBulkDelete = async (deletedPages: Page[]) => {
    try {
      const restorePromises = deletedPages.map(page =>
        fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(page),
        })
      );

      await Promise.all(restorePromises);
      
      undoManager.removeLastAction();
      toast.success(`Successfully restored ${deletedPages.length} page(s)`);
      fetchPages();
    } catch (error) {
      console.error('Bulk undo error:', error);
      toast.error('Failed to restore some pages');
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);
    
    // Show progress toast
    const toastId = toast.loading(`Publishing ${selectedIds.length} page(s)...`);

    try {
      const updatePromises = selectedIds.map(async (id) => {
        const page = pages.find(p => p._id?.toString() === id);
        if (!page) return;

        return fetch(`/api/pages/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...page, status: 'published' })
        });
      });

      await Promise.all(updatePromises);
      
      toast.success(`Successfully published ${selectedIds.length} page(s)`, {
        id: toastId,
      });
      setSelectedIds([]);
      fetchPages();
    } catch (error) {
      console.error('Bulk publish error:', error);
      toast.error('Failed to publish some pages', {
        id: toastId,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;

    const query = searchQuery.toLowerCase();
    return pages.filter(page => 
      page.title.toLowerCase().includes(query) ||
      page.slug.toLowerCase().includes(query) ||
      page.content.toLowerCase().includes(query)
    );
  }, [pages, searchQuery]);

  // Paginate filtered results
  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPages.slice(startIndex, endIndex);
  }, [filteredPages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);

  // Keyboard shortcut: Ctrl+A to select all
  useKeyboardShortcut(
    { key: 'a', ctrl: true, preventDefault: true },
    () => {
      if (paginatedPages.length > 0) {
        handleSelectAll();
      }
    },
    [paginatedPages, selectedIds]
  );

  // Keyboard shortcut: Delete to remove selected
  useKeyboardShortcut(
    { key: 'Delete', preventDefault: true },
    () => {
      if (selectedIds.length > 0) {
        setBulkDeleteConfirm(true);
      }
    },
    [selectedIds]
  );

  // Keyboard shortcut: Escape to clear selection
  useKeyboardShortcut(
    { key: 'Escape', preventDefault: false },
    () => {
      if (selectedIds.length > 0) {
        setSelectedIds([]);
      }
    },
    [selectedIds]
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pages</h1>
            <p className="text-gray-600 mt-1">Manage your website pages</p>
          </div>
        </div>
        <div className="mb-6 max-w-md">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-gray-600 mt-1">Manage your website pages</p>
        </div>
        <div className="flex gap-2">
          <ExportImport
            type="pages"
            apiEndpoint="/api/pages"
            requiredFields={['title', 'slug', 'content']}
            onImportComplete={fetchPages}
          />
          <Link href="/admin/pages/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <SearchInput
          placeholder="Search pages by title, slug, or content..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-blue-900">
              {selectedIds.length} page{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkPublish}
              disabled={bulkActionLoading}
            >
              Publish Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={bulkActionLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === paginatedPages.length && paginatedPages.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300"
                  aria-label="Select all pages"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No pages found matching your search.' : 'No pages yet. Create your first page!'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedPages.map((page) => (
                <TableRow key={page._id?.toString()}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(page._id?.toString() || '')}
                      onChange={() => handleSelectOne(page._id?.toString() || '')}
                      className="w-4 h-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${page.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      /{page.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/pages/${page._id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(page._id?.toString() || null)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredPages.length}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} page(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {selectedIds.length} page(s). You can undo this action from the notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

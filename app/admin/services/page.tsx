'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/admin/SearchInput';
import TableSkeleton from '@/components/admin/skeletons/TableSkeleton';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/admin/Pagination';
import ExportImport from '@/components/admin/ExportImport';

interface Service {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  status: 'active' | 'inactive';
  order: number;
  updatedAt: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const response = await fetch(`/api/services/${serviceToDelete}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else {
        toast.error(data.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;

    const query = searchQuery.toLowerCase();
    return services.filter(service => 
      service.title.toLowerCase().includes(query) ||
      service.shortDescription.toLowerCase().includes(query) ||
      service.fullDescription?.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  // Paginate filtered results
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedServices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedServices.map(service => service._id?.toString() || '').filter(Boolean));
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
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} service(s)?`)) {
      return;
    }

    setBulkActionLoading(true);

    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/services/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${selectedIds.length} service(s)`);
      setSelectedIds([]);
      fetchServices();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some services');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatus = async (status: 'active' | 'inactive') => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);

    try {
      const updatePromises = selectedIds.map(async (id) => {
        const service = services.find(s => s._id?.toString() === id);
        if (!service) return;

        return fetch(`/api/services/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...service, status })
        });
      });

      await Promise.all(updatePromises);
      
      toast.success(`Successfully set ${selectedIds.length} service(s) to ${status}`);
      setSelectedIds([]);
      fetchServices();
    } catch (error) {
      console.error('Bulk status error:', error);
      toast.error('Failed to update some services');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-gray-600 mt-1">Manage your services</p>
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
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <div className="flex gap-2">
          <ExportImport
            type="services"
            apiEndpoint="/api/services"
            requiredFields={['title', 'slug', 'shortDescription']}
            onImportComplete={fetchServices}
          />
          <Button onClick={() => router.push('/admin/services/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Service
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <SearchInput
          placeholder="Search services by title or description..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-blue-900">
              {selectedIds.length} service{selectedIds.length !== 1 ? 's' : ''} selected
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
              onClick={() => handleBulkStatus('active')}
              disabled={bulkActionLoading}
            >
              Activate Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatus('inactive')}
              disabled={bulkActionLoading}
            >
              Deactivate Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
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
                    checked={selectedIds.length === paginatedServices.length && paginatedServices.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                    aria-label="Select all services"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No services found matching your search.' : 'No services yet. Create your first service!'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                <TableRow key={service._id?.toString()}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(service._id?.toString() || '')}
                      onChange={() => handleSelectOne(service._id?.toString() || '')}
                      className="w-4 h-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${service.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      <Badge
                        variant="secondary"
                        className={
                          service.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-md truncate">
                    {service.shortDescription}
                  </TableCell>
                  <TableCell>{service.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/services/${service._id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(service._id?.toString() || '')}
                      >
                        <Trash2 className="w-4 h-4" />
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
          totalItems={filteredServices.length}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

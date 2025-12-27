'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
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

interface Customer {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  order: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/customers/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } else {
        toast.error(data.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading customers...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer logos</p>
        </div>
        <Link href="/admin/customers/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No customers found matching your search.' : 'No customers yet. Add your first customer!'}
            </div>
          ) : (
            filteredCustomers.map((customer: Customer) => (
              <div
                key={customer._id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {customer.logo ? (
                      <div className="relative w-24 h-16 bg-white border rounded overflow-hidden flex items-center justify-center">
                        <Image
                          src={customer.logo}
                          alt={customer.name}
                          width={96}
                          height={64}
                          className="object-contain max-w-full max-h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-16 bg-gray-100 border rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No logo</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      {customer.website && (
                        <p className="text-sm text-gray-500">{customer.website}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/customers/${customer._id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(customer._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


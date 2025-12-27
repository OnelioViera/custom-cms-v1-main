import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Customer } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const customersCollection = db.collection<Customer>('customers');

    const customer = await customersCollection.findOne({ _id: new ObjectId(id) });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        _id: customer._id?.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const db = await getDatabase();
    const customersCollection = db.collection('customers');

    const updateData = {
      name: data.name,
      logo: data.logo || '',
      website: data.website || '',
      order: data.order || 0,
      updatedAt: new Date(),
    };

    await customersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    cache.delete('customers:all');

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const customersCollection = db.collection<Customer>('customers');

    const result = await customersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    cache.delete('customers:all');

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}


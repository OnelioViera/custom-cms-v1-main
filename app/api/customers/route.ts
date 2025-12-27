import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Customer } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { cache } from '@/lib/cache';

// GET all customers
export async function GET() {
  try {
    const db = await getDatabase();
    const customersCollection = db.collection<Customer>('customers');
    
    const customers = await customersCollection
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      customers: customers.map(c => ({
        ...c,
        _id: c._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    const customersCollection = db.collection('customers');

    // Get the highest order number
    const lastCustomer = await customersCollection
      .findOne({}, { sort: { order: -1 } });
    const nextOrder = lastCustomer ? (lastCustomer.order || 0) + 1 : 0;

    const newCustomer = {
      name: data.name,
      logo: data.logo || '',
      website: data.website || '',
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await customersCollection.insertOne(newCustomer);

    cache.delete('customers:all');

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      customer: {
        ...newCustomer,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create customer' },
      { status: 500 }
    );
  }
}


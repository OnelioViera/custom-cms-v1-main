import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { User } from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if any users exist
    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists'
      }, { status: 400 });
    }

    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and name are required'
      }, { status: 400 });
    }

    // Create admin user
    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      userId: result.insertedId
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

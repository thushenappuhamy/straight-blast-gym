export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint creates an admin user.
 * In production, this should be protected or removed.
 * For now, it requires a setup token.
 */

export async function POST(request: NextRequest) {
  try {
    // Simple security check - in production, use proper authentication
    const setupToken = request.headers.get('x-setup-token');
    if (setupToken !== process.env.SETUP_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
      membershipStatus: 'active',
    });

    await admin.save();

    // Remove password from response
    const adminResponse = admin.toObject();
    delete (adminResponse as any).password;

    return NextResponse.json(
      {
        message: 'Admin created successfully',
        admin: adminResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if admin exists
 */
export async function GET() {
  try {
    await connectDB();
    const adminCount = await User.countDocuments({ role: 'admin' });
    return NextResponse.json(
      { adminExists: adminCount > 0, adminCount },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

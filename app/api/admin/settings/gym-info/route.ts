export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { Settings } from '@/models/Settings';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { User } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function PUT(request: NextRequest) {
  try {

    await connectDB();

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and check if admin
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update gym settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { gymName, phone, email, address, openingTime, closingTime, about } = body;


    // Get or create settings document
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update fields
    if (gymName) settings.gymName = gymName;
    if (phone) settings.phone = phone;
    if (email) settings.email = email;
    if (address) settings.address = address;
    if (openingTime) settings.openingTime = openingTime;
    if (closingTime) settings.closingTime = closingTime;
    if (about !== undefined) settings.about = about;

    await settings.save();

    return NextResponse.json(
      {
        message: 'Gym info updated successfully',
        data: settings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {

    await connectDB();

    // Get settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }


    return NextResponse.json(
      {
        data: settings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

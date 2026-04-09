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
    console.log("🏋️ [GYM INFO] Update request received");

    await connectDB();
    console.log("✅ [GYM INFO] Database connected");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error("❌ [GYM INFO] No token found");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and check if admin
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ [GYM INFO] Token verified for user:", decoded.email);
    } catch (error) {
      console.error("❌ [GYM INFO] Invalid token");
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      console.error("❌ [GYM INFO] User is not admin");
      return NextResponse.json(
        { error: 'Only admins can update gym settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { gymName, phone, email, address, openingTime, closingTime, about } = body;

    console.log("📝 [GYM INFO] Updating gym info:", { gymName, phone, email });

    // Get or create settings document
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log("📝 [GYM INFO] Creating new settings document");
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
    console.log("✅ [GYM INFO] Settings saved");

    return NextResponse.json(
      {
        message: 'Gym info updated successfully',
        data: settings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [GYM INFO] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🏋️ [GYM INFO] Get request received");

    await connectDB();
    console.log("✅ [GYM INFO] Database connected");

    // Get settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log("📝 [GYM INFO] No settings found, creating default");
      settings = new Settings();
      await settings.save();
    }

    console.log("✅ [GYM INFO] Settings retrieved successfully");

    return NextResponse.json(
      {
        data: settings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [GYM INFO] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

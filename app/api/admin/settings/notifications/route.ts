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
    console.log("🔔 [NOTIFICATIONS] Update request received");

    await connectDB();
    console.log("✅ [NOTIFICATIONS] Database connected");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error("❌ [NOTIFICATIONS] No token found");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and check if admin
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ [NOTIFICATIONS] Token verified for user:", decoded.email);
    } catch (error) {
      console.error("❌ [NOTIFICATIONS] Invalid token");
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      console.error("❌ [NOTIFICATIONS] User is not admin");
      return NextResponse.json(
        { error: 'Only admins can update notification settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      newMember,
      newOrder,
      trainerBooking,
      lowStock,
      membershipExpiry,
      adminEmail,
    } = body;

    console.log("📝 [NOTIFICATIONS] Updating notification settings:", {
      newMember,
      newOrder,
      adminEmail,
    });

    // Get or create settings document
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log("📝 [NOTIFICATIONS] Creating new settings document");
      settings = new Settings();
    }

    // Update notification preferences
    if (!settings.notificationPreferences) {
      settings.notificationPreferences = {};
    }

    if (newMember !== undefined) settings.notificationPreferences.newMember = newMember;
    if (newOrder !== undefined) settings.notificationPreferences.newOrder = newOrder;
    if (trainerBooking !== undefined) settings.notificationPreferences.trainerBooking = trainerBooking;
    if (lowStock !== undefined) settings.notificationPreferences.lowStock = lowStock;
    if (membershipExpiry !== undefined) settings.notificationPreferences.membershipExpiry = membershipExpiry;
    if (adminEmail) settings.notificationPreferences.adminEmail = adminEmail;

    await settings.save();
    console.log("✅ [NOTIFICATIONS] Settings saved");

    return NextResponse.json(
      {
        message: 'Notification settings updated successfully',
        data: settings.notificationPreferences,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [NOTIFICATIONS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔔 [NOTIFICATIONS] Get request received");

    await connectDB();
    console.log("✅ [NOTIFICATIONS] Database connected");

    // Get settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log("📝 [NOTIFICATIONS] No settings found, creating default");
      settings = new Settings();
      await settings.save();
    }

    console.log("✅ [NOTIFICATIONS] Settings retrieved successfully");

    return NextResponse.json(
      {
        data: settings.notificationPreferences,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [NOTIFICATIONS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

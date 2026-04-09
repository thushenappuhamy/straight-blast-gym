export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { Settings } from '@/models/Settings';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { User } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

// Simple encryption function for sensitive data
function encryptData(data: string): string {
  if (!data) return '';
  // Base64 encoding for basic security (in production, use proper encryption like crypto-js)
  return Buffer.from(data).toString('base64');
}

function decryptData(data: string): string {
  if (!data) return '';
  try {
    return Buffer.from(data, 'base64').toString('utf-8');
  } catch (error) {
    return '';
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("💳 [PAYMENT GATEWAY] Update request received");

    await connectDB();
    console.log("✅ [PAYMENT GATEWAY] Database connected");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error("❌ [PAYMENT GATEWAY] No token found");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and check if admin
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ [PAYMENT GATEWAY] Token verified for user:", decoded.email);
    } catch (error) {
      console.error("❌ [PAYMENT GATEWAY] Invalid token");
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      console.error("❌ [PAYMENT GATEWAY] User is not admin");
      return NextResponse.json(
        { error: 'Only admins can update payment settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentProvider, merchantId, merchantSecret, liveMode, emailReceipts } = body;

    console.log("📝 [PAYMENT GATEWAY] Updating payment settings:", {
      paymentProvider,
      liveMode,
      emailReceipts,
    });

    // Get or create settings document
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log("📝 [PAYMENT GATEWAY] Creating new settings document");
      settings = new Settings();
    }

    // Update fields
    if (paymentProvider) settings.paymentProvider = paymentProvider;
    if (merchantId) {
      // Encrypt sensitive data
      settings.merchantId = encryptData(merchantId);
      console.log("🔐 [PAYMENT GATEWAY] Merchant ID encrypted");
    }
    if (merchantSecret) {
      // Encrypt sensitive data
      settings.merchantSecret = encryptData(merchantSecret);
      console.log("🔐 [PAYMENT GATEWAY] Merchant Secret encrypted");
    }
    if (liveMode !== undefined) settings.liveMode = liveMode;
    if (emailReceipts !== undefined) settings.emailReceipts = emailReceipts;

    await settings.save();
    console.log("✅ [PAYMENT GATEWAY] Settings saved");

    return NextResponse.json(
      {
        message: 'Payment settings updated successfully',
        data: {
          paymentProvider: settings.paymentProvider,
          liveMode: settings.liveMode,
          emailReceipts: settings.emailReceipts,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [PAYMENT GATEWAY] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("💳 [PAYMENT GATEWAY] Get request received");

    await connectDB();
    console.log("✅ [PAYMENT GATEWAY] Database connected");

    // Get settings with sensitive fields selected
    let settings = await Settings.findOne().select('+merchantId +merchantSecret');
    
    if (!settings) {
      console.log("📝 [PAYMENT GATEWAY] No settings found, creating default");
      settings = new Settings();
      await settings.save();
    }

    const paymentData = {
      paymentProvider: settings.paymentProvider,
      merchantId: settings.merchantId ? decryptData(settings.merchantId) : '',
      merchantSecret: settings.merchantSecret ? decryptData(settings.merchantSecret) : '',
      liveMode: settings.liveMode,
      emailReceipts: settings.emailReceipts,
    };

    console.log("✅ [PAYMENT GATEWAY] Settings retrieved successfully");

    return NextResponse.json(
      {
        data: paymentData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [PAYMENT GATEWAY] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

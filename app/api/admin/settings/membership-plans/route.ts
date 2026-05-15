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
        { error: 'Only admins can update membership settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      basicPrice,
      goldPrice,
      elitePrice,
      goldDiscount,
      eliteDiscount,
      goldSessions,
      allowAnnualBilling,
      freeTrial,
    } = body;



    // Get or create settings document
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update fields
    if (basicPrice !== undefined) settings.basicPrice = basicPrice;
    if (goldPrice !== undefined) settings.goldPrice = goldPrice;
    if (elitePrice !== undefined) settings.elitePrice = elitePrice;
    if (goldDiscount !== undefined) settings.goldDiscount = goldDiscount;
    if (eliteDiscount !== undefined) settings.eliteDiscount = eliteDiscount;
    if (goldSessions !== undefined) settings.goldSessions = goldSessions;
    if (allowAnnualBilling !== undefined) settings.allowAnnualBilling = allowAnnualBilling;
    if (freeTrial !== undefined) settings.freeTrial = freeTrial;

    await settings.save();

    return NextResponse.json(
      {
        message: 'Membership plans updated successfully',
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

    const membershipData = {
      basicPrice: settings.basicPrice,
      goldPrice: settings.goldPrice,
      elitePrice: settings.elitePrice,
      goldDiscount: settings.goldDiscount,
      eliteDiscount: settings.eliteDiscount,
      goldSessions: settings.goldSessions,
      allowAnnualBilling: settings.allowAnnualBilling,
      freeTrial: settings.freeTrial,
    };


    return NextResponse.json(
      {
        data: membershipData,
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

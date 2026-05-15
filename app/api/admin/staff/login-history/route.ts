export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { LoginHistory } from '@/models/LoginHistory';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

// Middleware to verify admin token
const verifyAdminToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      throw new Error('Not authorized');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// GET - Retrieve login history (admin only)
export async function GET(request: NextRequest) {
  try {

    await connectDB();

    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    try {
      verifyAdminToken(token);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const email = searchParams.get('email');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter
    const filter: any = {};
    if (role) filter.role = role;
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (startDate || endDate) {
      filter.loginTime = {};
      if (startDate) filter.loginTime.$gte = new Date(startDate);
      if (endDate) filter.loginTime.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await LoginHistory.countDocuments(filter);

    // Get login history with pagination
    const loginHistory = await LoginHistory.find(filter)
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();


    return NextResponse.json(
      {
        data: loginHistory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch login history' },
      { status: 500 }
    );
  }
}

// POST - Log a login activity
export async function POST(request: NextRequest) {
  try {

    await connectDB();

    const body = await request.json();
    const {
      userId,
      email,
      firstName,
      lastName,
      role,
      loginTime,
      ipAddress,
      userAgent,
      device,
      browser,
      os,
      status = 'success',
      failureReason,
    } = body;

    // Validate required fields
    if (!userId || !email || !role || !ipAddress || !userAgent || !device || !browser || !os) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create login history record
    const newLoginHistory = new LoginHistory({
      userId,
      email,
      firstName,
      lastName,
      role,
      loginTime: loginTime ? new Date(loginTime) : new Date(),
      ipAddress,
      userAgent,
      device,
      browser,
      os,
      status,
      failureReason,
    });

    await newLoginHistory.save();


    return NextResponse.json(
      {
        message: 'Login history recorded',
        data: newLoginHistory,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to record login history' },
      { status: 500 }
    );
  }
}

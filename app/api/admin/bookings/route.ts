import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Booking from '@/src/models/Booking';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Extract token - handle both "Bearer token" and direct token
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token || token.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    console.log('🔐 [BOOKINGS API] Token length:', token.length, 'First 20 chars:', token.substring(0, 20));

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (verifyError: any) {
      console.error('❌ [BOOKINGS API] JWT verification failed:', verifyError.message);
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      console.error('❌ [BOOKINGS API] User is not admin, role:', decoded.role);
      return NextResponse.json(
        { success: false, error: 'Only admins can view bookings' },
        { status: 403 }
      );
    }

    await connectDB();

    // Fetch bookings with member and trainer details
    const bookings = await Booking.find()
      .populate('memberId', 'firstName lastName')
      .populate('trainerId', 'name')
      .sort({ dateTime: -1 });

    console.log('✅ [ADMIN BOOKINGS] Fetched:', bookings.length);

    const response = NextResponse.json({
      success: true,
      data: bookings,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('❌ [API] Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token || token.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (verifyError: any) {
      console.error('❌ [BOOKINGS API] JWT verification failed:', verifyError.message);
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      console.error('❌ [BOOKINGS API] User is not admin, role:', decoded.role);
      return NextResponse.json(
        { success: false, error: 'Only admins can create bookings' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { memberId, trainerId, type, fee, dateTime, status, notes } = body;

    // Validate required fields
    if (!memberId || !trainerId || !type || !fee || !dateTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = new Booking({
      memberId,
      trainerId,
      type,
      fee,
      dateTime,
      status: status || 'UPCOMING',
      notes,
    });

    await booking.save();

    // Populate member and trainer details
    await booking.populate('memberId', 'firstName lastName');
    await booking.populate('trainerId', 'name');

    console.log('✅ [ADMIN BOOKINGS] Created:', booking._id);

    const response = NextResponse.json({
      success: true,
      data: booking,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('❌ [API] Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create booking' },
      { status: 500 }
    );
  }
}

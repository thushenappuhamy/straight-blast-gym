export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Booking from '@/src/models/Booking';
import { Trainer } from '@/src/models/Trainer';
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

    await connectDB();

    // Fetch user's bookings
    const bookings = await Booking.find({ memberId: decoded.id })
      .populate('trainerId', 'firstName lastName')
      .sort({ dateTime: -1 });

    console.log('✅ [PUBLIC BOOKINGS] Fetched for user:', decoded.id);

    // Return with no-cache headers to ensure fresh data
    const response = NextResponse.json({
      success: true,
      data: bookings,
    });

    // Prevent caching - always fetch fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('❌ [API] Error fetching user bookings:', error);
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

    await connectDB();

    const body = await req.json();
    const { trainerId, type, fee, dateTime, notes } = body;

    // Validate required fields
    if (!trainerId || !type || fee === undefined || !dateTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = new Booking({
      memberId: decoded.id,
      trainerId,
      type,
      fee: Number(fee),
      dateTime: new Date(dateTime),
      status: 'UPCOMING',
      notes,
    });

    await booking.save();

    // Update trainer stats
    try {
      const trainer = await Trainer.findById(trainerId);
      if (trainer) {
        // Use set to ensure unique member IDs
        const clientIds = trainer.assignedClients.map((id: any) => id.toString());
        if (!clientIds.includes(decoded.id)) {
          trainer.assignedClients.push(decoded.id);
          trainer.totalClients = trainer.assignedClients.length;
          await trainer.save();
          console.log('📈 [BOOKINGS API] Trainer client count incremented');
        }
      }
    } catch (trainerError) {
      console.error('⚠️ [BOOKINGS API] Failed to update trainer stats:', trainerError);
    }

    console.log('✅ [PUBLIC BOOKINGS] Created booking for user:', decoded.id);

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('❌ [API] Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create booking' },
      { status: 500 }
    );
  }
}

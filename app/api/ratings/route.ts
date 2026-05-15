export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Booking from '@/src/models/Booking';
import { Trainer } from '@/src/models/Trainer';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { trainerId, bookingId, rating } = body;

    if (!trainerId || !bookingId || !rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.memberId.toString() !== decoded.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Only completed sessions can be rated' }, { status: 400 });
    }

    // Update trainer rating
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 });
    }

    const currentCount = trainer.ratingCount || 0;
    const currentAvg = trainer.ratingAverage || 0;
    
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + rating) / newCount;

    trainer.ratingCount = newCount;
    trainer.ratingAverage = Number(newAvg.toFixed(1));
    await trainer.save();

    // Mark booking as rated (optional, but good for UI)
    // We can add a 'isRated' field to Booking if needed
    
    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        newAverage: trainer.ratingAverage,
        newCount: trainer.ratingCount
      }
    });
  } catch (error) {
    console.error('❌ [RATINGS API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

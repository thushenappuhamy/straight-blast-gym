export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Booking from '@/src/models/Booking';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
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

    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [thisMonthCount, todaySessions, upcomingSessions, cancellations] = await Promise.all([
      Booking.countDocuments({
        dateTime: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      }),
      Booking.find({
        dateTime: { $gte: today, $lt: tomorrow }
      }),
      Booking.countDocuments({
        status: 'UPCOMING'
      }),
      Booking.countDocuments({
        status: 'CANCELLED'
      })
    ]);

    const completedToday = todaySessions.filter(b => b.status === 'COMPLETED').length;

    return NextResponse.json({
      success: true,
      data: {
        thisMonth: thisMonthCount,
        today: todaySessions.length,
        completedToday,
        upcoming: upcomingSessions,
        cancellations
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

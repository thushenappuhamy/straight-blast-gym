export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { Attendance } from '@/src/models/Attendance';
import { MemberProfile } from '@/src/models/MemberProfile';
import { User } from '@/src/models/User';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch attendance records (with filtering)
export async function GET(req: NextRequest) {
  try {
    console.log('📋 [ATTENDANCE API] GET request received');

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('❌ [ATTENDANCE API] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded: any = verify(token, JWT_SECRET);
      console.log('✅ [ATTENDANCE API] Token verified');
    } catch (err) {
      console.error('❌ [ATTENDANCE API] Token verification failed:', err);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const date = searchParams.get('date');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const skip = parseInt(searchParams.get('skip') || '0');

    let query: any = {};

    if (memberId) {
      query.memberProfileId = memberId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const records = await Attendance.find(query)
      .populate('memberProfileId', 'firstName lastName email')
      .populate('userId', 'firstName lastName')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments(query);

    console.log(`✅ [ATTENDANCE API] Retrieved ${records.length} attendance records`);

    return NextResponse.json(
      {
        success: true,
        data: records,
        total,
        count: records.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [ATTENDANCE API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records: ' + String(error) },
      { status: 500 }
    );
  }
}

// POST - Mark attendance (check-in)
export async function POST(req: NextRequest) {
  try {
    console.log('📝 [ATTENDANCE API] POST request received');

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('❌ [ATTENDANCE API] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
      console.log('✅ [ATTENDANCE API] Token verified');
    } catch (err) {
      console.error('❌ [ATTENDANCE API] Token verification failed:', err);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      console.log('❌ [ATTENDANCE API] User is not admin');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { fingerprintId, memberId, attendanceType = 'fingerprint', notes } = body;

    console.log('📥 [ATTENDANCE API] Request body:', { fingerprintId, memberId, attendanceType });

    // Validate input
    if (!fingerprintId && !memberId) {
      return NextResponse.json(
        { error: 'Either fingerprintId or memberId is required' },
        { status: 400 }
      );
    }

    // Find member profile
    let memberProfile;
    if (fingerprintId) {
      memberProfile = await MemberProfile.findOne({ fingerprintId });
      if (!memberProfile) {
        console.log('❌ [ATTENDANCE API] Fingerprint not found:', fingerprintId);
        return NextResponse.json({ error: 'Member not found for this fingerprint' }, { status: 404 });
      }
    } else if (memberId) {
      memberProfile = await MemberProfile.findById(memberId);
      if (!memberProfile) {
        console.log('❌ [ATTENDANCE API] Member not found:', memberId);
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
    }

    // Check if member is active
    if (!memberProfile.isActive) {
      console.log('⚠️ [ATTENDANCE API] Member is inactive:', memberProfile._id);
      return NextResponse.json(
        { error: 'Member is inactive. Please renew membership.' },
        { status: 403 }
      );
    }

    // Check if membership is still valid
    const now = new Date();
    if (memberProfile.membershipEndDate < now) {
      console.log('⚠️ [ATTENDANCE API] Membership expired for:', memberProfile._id);
      // Deactivate member
      memberProfile.isActive = false;
      await memberProfile.save();
      return NextResponse.json(
        { error: 'Membership has expired. Please renew to continue.' },
        { status: 403 }
      );
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingCheckIn = await Attendance.findOne({
      memberProfileId: memberProfile._id,
      date: { $gte: today },
      checkOutTime: null, // No check-out yet
    });

    if (existingCheckIn) {
      // Update check-out time
      const checkInTime = new Date(existingCheckIn.checkInTime);
      const duration = Math.round((now.getTime() - checkInTime.getTime()) / 60000); // in minutes
      existingCheckIn.checkOutTime = now;
      existingCheckIn.duration = duration;
      await existingCheckIn.save();

      console.log(`✅ [ATTENDANCE API] Check-out recorded for member: ${memberProfile._id}`);

      return NextResponse.json(
        {
          success: true,
          message: 'Check-out successful',
          data: existingCheckIn,
        },
        { status: 200 }
      );
    }

    // Create new check-in attendance record
    const attendance = new Attendance({
      memberProfileId: memberProfile._id,
      userId: memberProfile.userId,
      fingerprintId: fingerprintId || memberProfile.fingerprintId,
      checkInTime: now,
      date: today,
      attendanceType,
      notes,
    });

    await attendance.save();

    console.log(`✅ [ATTENDANCE API] Check-in recorded for member: ${memberProfile._id}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Check-in successful',
        data: attendance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ [ATTENDANCE API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance: ' + String(error) },
      { status: 500 }
    );
  }
}

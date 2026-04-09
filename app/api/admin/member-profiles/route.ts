import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { MemberProfile } from '@/src/models/MemberProfile';
import { User } from '@/src/models/User';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch all member profiles
export async function GET(req: NextRequest) {
  try {
    console.log('👥 [MEMBER PROFILES API] GET request received');

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('❌ [MEMBER PROFILES API] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded: any = verify(token, JWT_SECRET);
      console.log('✅ [MEMBER PROFILES API] Token verified');
    } catch (err) {
      console.error('❌ [MEMBER PROFILES API] Token verification failed:', err);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // active, expired, all
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
    const skip = parseInt(searchParams.get('skip') || '0');

    let query: any = {};

    if (status === 'active') {
      query.isActive = true;
      query.membershipEndDate = { $gt: new Date() };
    } else if (status === 'expired') {
      query.$or = [
        { isActive: false },
        { membershipEndDate: { $lte: new Date() } },
      ];
    }

    const profiles = await MemberProfile.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MemberProfile.countDocuments(query);

    const formattedProfiles = profiles.map((profile: any) => ({
      _id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      plan: profile.membershipPlan.toUpperCase(),
      startDate: profile.membershipStartDate.toLocaleDateString(),
      endDate: profile.membershipEndDate.toLocaleDateString(),
      paymentStatus: profile.paymentStatus,
      isActive: profile.isActive,
      fingerprintId: profile.fingerprintId,
      registrationSource: profile.registrationSource,
      daysRemaining: Math.max(0, Math.ceil((profile.membershipEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
    }));

    console.log(`✅ [MEMBER PROFILES API] Retrieved ${profiles.length} profiles`);

    return NextResponse.json(
      {
        success: true,
        data: formattedProfiles,
        total,
        count: profiles.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [MEMBER PROFILES API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member profiles: ' + String(error) },
      { status: 500 }
    );
  }
}

// POST - Create new member profile
export async function POST(req: NextRequest) {
  try {
    console.log('📝 [MEMBER PROFILES API] POST request received');

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('❌ [MEMBER PROFILES API] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
      console.log('✅ [MEMBER PROFILES API] Token verified');
    } catch (err) {
      console.error('❌ [MEMBER PROFILES API] Token verification failed:', err);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.role !== 'admin') {
      console.log('❌ [MEMBER PROFILES API] User is not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const {
      userId,
      firstName,
      lastName,
      email,
      phone,
      membershipPlan,
      durationMonths,
      paymentStatus = 'completed',
      paymentMethod,
      transactionId,
      fingerprintId,
      registrationSource = 'admin',
    } = body;

    console.log('📥 [MEMBER PROFILES API] Request body:', { userId, email, membershipPlan });

    // Validate required fields
    if (!userId || !firstName || !lastName || !membershipPlan || !durationMonths) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, firstName, lastName, membershipPlan, durationMonths' },
        { status: 400 }
      );
    }

    // Calculate membership end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Check if member already has active profile
    const existingProfile = await MemberProfile.findOne({ userId });
    if (existingProfile && existingProfile.isActive && existingProfile.membershipEndDate > new Date()) {
      console.log('⚠️ [MEMBER PROFILES API] Member already has active membership');
      return NextResponse.json(
        { error: 'Member already has an active membership' },
        { status: 409 }
      );
    }

    // Create member profile
    const memberProfile = new MemberProfile({
      userId,
      firstName,
      lastName,
      email,
      phone,
      membershipPlan,
      membershipStartDate: startDate,
      membershipEndDate: endDate,
      paymentStatus,
      paymentMethod,
      transactionId,
      fingerprintId,
      isActive: paymentStatus === 'completed',
      registrationSource,
    });

    await memberProfile.save();

    // Update user to mark they have a member profile
    await User.findByIdAndUpdate(userId, {
      hasMemberProfile: true,
      fingerprintId: fingerprintId,
    });

    console.log(`✅ [MEMBER PROFILES API] Member profile created: ${memberProfile._id}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Member profile created successfully',
        data: memberProfile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ [MEMBER PROFILES API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create member profile: ' + String(error) },
      { status: 500 }
    );
  }
}

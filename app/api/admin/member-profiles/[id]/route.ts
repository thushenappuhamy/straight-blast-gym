import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { MemberProfile } from '@/src/models/MemberProfile';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch single member profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('👤 [MEMBER PROFILE API] GET request for ID:', id);

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
    }

    const profile = await MemberProfile.findById(id).populate('userId', 'firstName lastName email');

    if (!profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    console.log('✅ [MEMBER PROFILE API] Retrieved profile:', id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('❌ [MEMBER PROFILE API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member profile: ' + String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update member profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 [MEMBER PROFILE API] PUT request for ID:', id);

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, fingerprintId, isActive } = body;

    console.log('📥 [MEMBER PROFILE API] Update data:', { firstName, lastName, phone });

    const profile = await MemberProfile.findByIdAndUpdate(
      id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(fingerprintId && { fingerprintId }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    console.log('✅ [MEMBER PROFILE API] Profile updated:', id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('❌ [MEMBER PROFILE API] PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update member profile: ' + String(error) },
      { status: 500 }
    );
  }
}

// POST - Renew membership
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔄 [MEMBER PROFILE API] Renewal request for ID:', id);

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
    }

    const body = await req.json();
    const { durationMonths = 1, paymentStatus = 'completed' } = body;

    const profile = await MemberProfile.findById(id);

    if (!profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Calculate new end date
    const newEndDate = new Date(profile.membershipEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

    // Update profile
    profile.membershipEndDate = newEndDate;
    profile.paymentStatus = paymentStatus;
    profile.isActive = paymentStatus === 'completed';
    profile.paymentDate = new Date();

    await profile.save();

    console.log(`✅ [MEMBER PROFILE API] Membership renewed until: ${newEndDate.toLocaleDateString()}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Membership renewed successfully',
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [MEMBER PROFILE API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to renew membership: ' + String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ [MEMBER PROFILE API] DELETE request for ID:', id);

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
    }

    const profile = await MemberProfile.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    console.log('✅ [MEMBER PROFILE API] Member deactivated:', id);

    return NextResponse.json({
      success: true,
      message: 'Member deactivated successfully',
      data: profile,
    });
  } catch (error) {
    console.error('❌ [MEMBER PROFILE API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate member: ' + String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { User } from '@/src/models/User';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body; 

    if (!plan) {
      return NextResponse.json({ success: false, error: 'No plan selected' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    user.plan = plan.toLowerCase();
    user.membershipStatus = 'active';
    user.membershipStartDate = new Date();
    await user.save();

    console.log(`✅ [MEMBERSHIP API] User ${decoded.id} subscribed to ${plan}`);

    return NextResponse.json({
      success: true,
      data: { plan: user.plan, status: user.membershipStatus },
      message: 'Successfully subscribed to membership plan'
    });

  } catch (error: any) {
    console.error('❌ [MEMBERSHIP API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

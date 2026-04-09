export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function GET(request: NextRequest) {
  try {
    console.log('👥 [ADMIN MEMBERS] Fetching members list...');

    await connectDB();
    console.log('✅ [ADMIN MEMBERS] Database connected');

    // Get token from Authorization header or cookies
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
      console.log('✅ [ADMIN MEMBERS] Token found in Authorization header');
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get('authToken')?.value;
      if (token) {
        console.log('✅ [ADMIN MEMBERS] Token found in cookies');
      }
    }

    if (!token) {
      console.error('❌ [ADMIN MEMBERS] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [ADMIN MEMBERS] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [ADMIN MEMBERS] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      console.error('❌ [ADMIN MEMBERS] User is not an admin');
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all members (users with role 'user')
    const members = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });

    console.log(`✅ [ADMIN MEMBERS] Retrieved ${members.length} members`);

    // Map to member display format
    const formattedMembers = members.map((user: any) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const avatar = (user.firstName?.[0] || 'U').toUpperCase();
      const avatarColors = ['bg-[#F4D03F]', 'bg-gray-400', 'bg-orange-400', 'bg-pink-400', 'bg-green-500', 'bg-blue-400', 'bg-red-400', 'bg-purple-400'];
      const avatarColor = avatarColors[Math.abs(user._id.toString().charCodeAt(0)) % avatarColors.length];

      return {
        _id: user._id.toString(),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: fullName,
        email: user.email,
        avatar,
        avatarColor,
        plan: (user.plan || 'basic').toUpperCase(),
        bmi: user.bmi || 0,
        goal: user.fitnessGoal?.[0] || 'Not specified',
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
        status: (user.membershipStatus || 'pending').toUpperCase(),
      };
    });

    const response = NextResponse.json(
      {
        data: formattedMembers,
        total: formattedMembers.length,
      },
      { status: 200 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('❌ [ADMIN MEMBERS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👥 [ADMIN MEMBERS] Adding new member...');

    await connectDB();
    console.log('✅ [ADMIN MEMBERS] Database connected');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error('❌ [ADMIN MEMBERS] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [ADMIN MEMBERS] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [ADMIN MEMBERS] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      console.error('❌ [ADMIN MEMBERS] User is not an admin');
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    const { firstName, lastName, email, password, plan, membershipStatus } = body;
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, password' },
        { status: 400 }
      );
    }

    // Check if member already exists
    const existingMember = await User.findOne({ email });
    if (existingMember) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 400 }
      );
    }

    // Create new member
    const newMember = new User({
      firstName,
      lastName,
      email,
      password,
      role: 'user',
      plan: plan || 'basic',
      membershipStatus: membershipStatus || 'pending',
      gender: body.gender || 'Other',
      dateOfBirth: body.dateOfBirth || null,
      fitnessGoal: body.fitnessGoal || [],
      bmi: body.bmi || 0,
      height: body.height || 0,
      weight: body.weight || 0,
    });

    await newMember.save();

    console.log('✅ [ADMIN MEMBERS] Member added:', newMember._id);

    const response = NextResponse.json(
      {
        message: 'Member added successfully',
        data: {
          id: newMember._id.toString(),
          name: `${newMember.firstName} ${newMember.lastName}`,
          email: newMember.email,
          plan: newMember.plan,
          status: newMember.membershipStatus,
        },
      },
      { status: 201 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('❌ [ADMIN MEMBERS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

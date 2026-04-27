export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { Trainer } from '@/models/Trainer';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function GET(request: NextRequest) {
  try {
    console.log('👨‍🏫 [ADMIN TRAINERS] Fetching trainers list...');

    await connectDB();
    console.log('✅ [ADMIN TRAINERS] Database connected');

    // Get token from Authorization header or cookies
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
      console.log('✅ [ADMIN TRAINERS] Token found in Authorization header');
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get('authToken')?.value;
      if (token) {
        console.log('✅ [ADMIN TRAINERS] Token found in cookies');
      }
    }

    if (!token) {
      console.error('❌ [ADMIN TRAINERS] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [ADMIN TRAINERS] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [ADMIN TRAINERS] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      console.error('❌ [ADMIN TRAINERS] User is not an admin');
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all trainers sorted by featured first, then by rating
    const trainers = await Trainer.find().sort({ isFeatured: -1, ratingAverage: -1 });

    console.log(`✅ [ADMIN TRAINERS] Retrieved ${trainers.length} trainers`);

    // Map to trainer display format
    const formattedTrainers = trainers.map((trainer: any) => {
      const fullName = `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim();
      const avatar = (trainer.firstName?.[0] || 'T').toUpperCase();
      const avatarEmojis = ['🧑', '👨', '👩', '🧔', '👨‍🦰', '👨‍🦱'];
      const avatarEmoji = avatarEmojis[Math.abs(trainer._id.toString().charCodeAt(0)) % avatarEmojis.length];

      const specialtyColors: Record<string, string> = {
        'Strength & Conditioning': 'bg-[#5A4A00] text-[#F4D03F]',
        'Nutrition & Weight Loss': 'bg-[#1A3A2A] text-green-400',
        'Bodybuilding & Hypertrophy': 'bg-[#3A1A3A] text-purple-400',
        'Functional Training': 'bg-[#1A2A3A] text-blue-400',
        'Yoga & Flexibility': 'bg-[#2A3A1A] text-lime-400',
        'CrossFit': 'bg-[#3A1A1A] text-red-400',
        'HIIT & Cardio': 'bg-[#3A2A1A] text-orange-400',
        'Powerlifting': 'bg-[#1A1A2A] text-indigo-400',
        'Boxing & MMA': 'bg-[#2A1A1A] text-rose-400',
      };

      return {
        _id: trainer._id.toString(),
        name: fullName,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        email: trainer.email,
        phone: trainer.phone,
        specialty: trainer.specialty,
        specialtyColor: specialtyColors[trainer.specialty] || 'bg-gray-600 text-white',
        badge: trainer.isFeatured ? 'HEAD COACH' : null,
        tags: trainer.tags || [],
        experience: trainer.experience,
        clients: trainer.totalClients,
        assignedClients: trainer.assignedClients || [],
        rating: trainer.ratingAverage || 0,
        perSession: trainer.costPerSession,
        featured: trainer.isFeatured,
        avatar: avatarEmoji,
        status: trainer.status,
        qualifications: trainer.qualifications || [],
        certifications: trainer.certifications || [],
        specializations: trainer.specializations || [],
        sessionsThisMonth: trainer.sessionsThisMonth,
        bio: trainer.bio,
        // Shift info
        shiftStartTime: trainer.shiftStartTime,
        shiftEndTime: trainer.shiftEndTime,
        shiftDays: trainer.shiftDays || [],
        currentlyActive: trainer.currentlyActive || false,
        costPerSession: trainer.costPerSession,
      };
    });

    const response = NextResponse.json(
      {
        data: formattedTrainers,
        total: formattedTrainers.length,
      },
      { status: 200 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('❌ [ADMIN TRAINERS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👨‍🏫 [ADMIN TRAINERS] Adding new trainer...');

    await connectDB();
    console.log('✅ [ADMIN TRAINERS] Database connected');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error('❌ [ADMIN TRAINERS] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [ADMIN TRAINERS] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [ADMIN TRAINERS] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      console.error('❌ [ADMIN TRAINERS] User is not an admin');
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    const { firstName, lastName, email, phone, specialty, costPerSession } = body;
    if (!firstName || !lastName || !email || !phone || !specialty || costPerSession === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return NextResponse.json(
        { error: 'Trainer with this email already exists' },
        { status: 400 }
      );
    }

    // Create new trainer
    const newTrainer = new Trainer({
      firstName,
      lastName,
      email,
      phone,
      specialty,
      costPerSession,
      qualifications: body.qualifications || [],
      certifications: body.certifications || [],
      experience: body.experience || 0,
      bio: body.bio || '',
      totalClients: body.totalClients || 0,
      ratingAverage: body.ratingAverage || 0,
      sessionsThisMonth: body.sessionsThisMonth || 0,
      status: body.status || 'active',
      isFeatured: body.isFeatured || false,
      specializations: body.specializations || [],
      tags: body.tags || [],
      // Shift & Schedule
      shiftStartTime: body.shiftStartTime || '06:00',
      shiftEndTime: body.shiftEndTime || '22:00',
      shiftDays: body.shiftDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      assignedClients: body.assignedClients || [],
      currentlyActive: false,
    });

    await newTrainer.save();

    console.log('✅ [ADMIN TRAINERS] Trainer added:', newTrainer._id);

    const response = NextResponse.json(
      {
        message: 'Trainer added successfully',
        data: newTrainer,
      },
      { status: 201 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('❌ [ADMIN TRAINERS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

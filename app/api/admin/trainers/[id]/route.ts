export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { Trainer } from '@/models/Trainer';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await connectDB();

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find trainer
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    const body = await request.json();

    // Update trainer fields
    if (body.firstName) trainer.firstName = body.firstName;
    if (body.lastName) trainer.lastName = body.lastName;
    if (body.email) trainer.email = body.email;
    if (body.phone) trainer.phone = body.phone;
    if (body.specialty) trainer.specialty = body.specialty;
    if (body.costPerSession !== undefined) trainer.costPerSession = body.costPerSession;
    if (body.experience !== undefined) trainer.experience = body.experience;
    if (body.bio) trainer.bio = body.bio;
    if (body.status) trainer.status = body.status;
    if (body.qualifications) trainer.qualifications = body.qualifications;
    if (body.certifications) trainer.certifications = body.certifications;
    if (body.specializations) trainer.specializations = body.specializations;
    if (body.isFeatured !== undefined) trainer.isFeatured = body.isFeatured;
    if (body.tags) trainer.tags = body.tags;
    
    // Update shift info
    if (body.shiftStartTime) trainer.shiftStartTime = body.shiftStartTime;
    if (body.shiftEndTime) trainer.shiftEndTime = body.shiftEndTime;
    if (body.shiftDays) trainer.shiftDays = body.shiftDays;
    
    // Update assigned clients if provided
    if (body.assignedClients) trainer.assignedClients = body.assignedClients;

    // Save updated trainer
    await trainer.save();


    const response = NextResponse.json(
      {
        message: 'Trainer updated successfully',
        data: trainer,
      },
      { status: 200 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update trainer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await connectDB();

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Delete trainer
    const result = await Trainer.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }


    const response = NextResponse.json(
      { message: 'Trainer deleted successfully' },
      { status: 200 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete trainer' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Membership from '@/src/models/Membership';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get id from the promise params
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded: any = verify(token, JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can update memberships' },
        { status: 403 }
      );
    }

    await connectDB();

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid membership ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, description, tagline, price, duration, features, icon, color, badge, isFeatured, isActive } = body;

    const membership = await Membership.findByIdAndUpdate(
      id,
      {
        name,
        description,
        tagline,
        price,
        duration,
        features,
        icon,
        color,
        badge,
        isFeatured,
        isActive,
      },
      { new: true }
    );

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Membership not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: membership,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update membership' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get id from the promise params
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded: any = verify(token, JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can delete memberships' },
        { status: 403 }
      );
    }

    await connectDB();

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid membership ID' },
        { status: 400 }
      );
    }

    const membership = await Membership.findByIdAndDelete(id);

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Membership not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Membership deleted successfully',
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete membership' },
      { status: 500 }
    );
  }
}

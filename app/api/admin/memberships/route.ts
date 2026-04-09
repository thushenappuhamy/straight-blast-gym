export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Membership from '@/src/models/Membership';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const memberships = await Membership.find({ isActive: true }).sort({ price: 1 });

    const response = NextResponse.json({
      success: true,
      data: memberships,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
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
        { success: false, error: 'Only admins can add memberships' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { name, description, tagline, price, duration, features, icon, color, badge, isFeatured } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, price' },
        { status: 400 }
      );
    }

    const membership = new Membership({
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
    });

    await membership.save();

    const response = NextResponse.json({
      success: true,
      data: membership,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error adding membership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add membership' },
      { status: 500 }
    );
  }
}

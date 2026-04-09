import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Membership from '@/src/models/Membership';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch only active memberships, sorted by price
    const memberships = await Membership.find({ isActive: true }).sort({ price: 1 });

    console.log('✅ [API MEMBERSHIPS] Fetched:', memberships.length, 'plans');

    // Return with no-cache headers to ensure fresh data
    const response = NextResponse.json({
      success: true,
      data: memberships,
    });

    // Prevent caching - always fetch fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('❌ [API MEMBERSHIPS] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Trainer } from '@/models/Trainer';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch all trainers (active and inactive), excluding deleted
    // Sort by featured first, then by rating
    const trainers = await Trainer.find({ status: { $ne: 'deleted' } })
      .sort({ isFeatured: -1, ratingAverage: -1 })
      .lean();


    // Return with no-cache headers to ensure fresh data
    const response = NextResponse.json({
      success: true,
      data: trainers,
    });

    // Prevent caching - always fetch fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trainers' },
      { status: 500 }
    );
  }
}

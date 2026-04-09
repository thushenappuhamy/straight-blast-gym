export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Supplement from '@/src/models/Supplement';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch only active supplements, sorted by newest first
    const supplements = await Supplement.find({ status: 'active' }).sort({ createdAt: -1 });

    console.log('✅ [API SUPPLEMENTS] Fetched:', supplements.length, 'items');

    // Return with no-cache headers to ensure fresh data
    const response = NextResponse.json({
      success: true,
      data: supplements,
    });

    // Prevent caching - always fetch fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('❌ [API SUPPLEMENTS] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplements' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Trainer } from '@/models/Trainer';
import Booking from '@/src/models/Booking';
import Supplement from '@/src/models/Supplement';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    console.log('📊 [ANALYTICS API] Processing request...');

    // Get token from Authorization header or cookies
    let token = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      console.error('❌ [ANALYTICS API] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      console.error('❌ [ANALYTICS API] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify admin role
    if (decoded.role !== 'admin') {
      console.error('❌ [ANALYTICS API] User is not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get date ranges
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Revenue Growth (This Month vs Last Month)
    const thisMonthRevenue = await Booking.aggregate([
      {
        $match: {
          dateTime: { $gte: thisMonth },
          status: { $in: ['COMPLETED', 'IN SESSION'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$fee' } } },
    ]);

    const lastMonthRevenue = await Booking.aggregate([
      {
        $match: {
          dateTime: { $gte: lastMonth, $lte: lastMonthEnd },
          status: { $in: ['COMPLETED', 'IN SESSION'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$fee' } } },
    ]);

    const currentRevenue = thisMonthRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth =
      previousRevenue === 0
        ? 0
        : Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);

    // 2. New Members This Week
    const newMembersThisWeek = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thisWeek },
    });

    // 3. Retention Rate (members with bookings in last 30 days)
    const totalMembers = await User.countDocuments({ role: 'user' });
    const activeMembers = await Booking.distinct('memberId', {
      dateTime: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    });
    const retentionRate = totalMembers === 0 ? 0 : Math.round((activeMembers.length / totalMembers) * 100);

    // 4. Average Trainer Rating
    const trainers = await Trainer.find({ ratingAverage: { $gt: 0 } });
    const avgTrainerRatingCalc =
      trainers.length === 0
        ? 0
        : parseFloat((trainers.reduce((sum, t) => sum + t.ratingAverage, 0) / trainers.length).toFixed(1));

    console.log('📊 [ANALYTICS] Trainers count:', trainers.length, 'Avg rating:', avgTrainerRatingCalc);

    // 5. Member Growth by Month (2026)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const memberGrowth = await Promise.all(
      months.map(async (month, index) => {
        const monthDate = new Date(2026, index, 1);
        const nextMonth = new Date(2026, index + 1, 1);
        const count = await User.countDocuments({
          role: 'user',
          createdAt: { $gte: monthDate, $lt: nextMonth },
        });
        return { month, count };
      })
    );

    // 6. Revenue Breakdown (by booking type)
    const revenueBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$fee' },
          count: { $sum: 1 },
        },
      },
    ]);

    const breakdownMap: Record<string, { total: number; count: number; percentage: number }> = {
      STRENGTH: { total: 0, count: 0, percentage: 0 },
      CARDIO: { total: 0, count: 0, percentage: 0 },
      NUTRITION: { total: 0, count: 0, percentage: 0 },
      HYPERTROPHY: { total: 0, count: 0, percentage: 0 },
    };

    const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.total, 0);

    revenueBreakdown.forEach((item) => {
      if (breakdownMap[item._id]) {
        breakdownMap[item._id] = {
          total: item.total,
          count: item.count,
          percentage: totalRevenue === 0 ? 0 : Math.round((item.total / totalRevenue) * 100),
        };
      }
    });

    // 7. Top Selling Supplements
    const topSupplements = await Supplement.find()
      .select('name salesThisMonth')
      .sort({ salesThisMonth: -1 })
      .limit(3);

    const supplementData = topSupplements.map((supplement: any) => {
      const maxSales = topSupplements[0]?.salesThisMonth || 1;
      const salesCount = supplement.salesThisMonth || 0;
      return {
        name: supplement.name || 'Unknown',
        count: salesCount,
        percentage: maxSales === 0 ? 0 : Math.round((salesCount / maxSales) * 100),
      };
    });

    // 8. Member Goals Distribution
    const memberGoals = await User.aggregate([
      { $match: { role: 'user', fitnessGoal: { $exists: true, $ne: [] } } },
      { $unwind: '$fitnessGoal' },
      {
        $group: {
          _id: '$fitnessGoal',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalGoalMembers = memberGoals.reduce((sum, g) => sum + g.count, 0);
    const goalsData = memberGoals.map((goal) => ({
      goal: goal._id || 'Not specified',
      count: goal.count,
      percentage: totalGoalMembers === 0 ? 0 : Math.round((goal.count / totalGoalMembers) * 100),
    }));

    console.log('✅ [ANALYTICS API] Calculated all metrics');
    console.log('📊 Summary:', {
      memberGrowth: memberGrowth.slice(0, 3),
      revenueBreakdown: Object.keys(breakdownMap).map(k => `${k}: ${breakdownMap[k].percentage}%`),
      topSupplements: supplementData.length,
      totalMembers,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        stats: {
          revenueGrowth,
          newMembers: newMembersThisWeek,
          retentionRate,
          avgTrainerRating: avgTrainerRatingCalc,
        },
        memberGrowth,
        revenueBreakdown: breakdownMap,
        topSupplements: supplementData,
        memberGoals: goalsData,
        summary: {
          totalMembers,
          activeMembers: activeMembers.length,
          totalRevenue,
          totalSessions: totalRevenue === 0 ? 0 : Math.round(totalRevenue / 5000), // Rough estimate
        },
      },
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('❌ [ANALYTICS API] Error calculating analytics:');
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to calculate analytics',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

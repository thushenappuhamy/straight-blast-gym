export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Trainer } from '@/models/Trainer';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

// Middleware to verify admin token
const verifyAdminToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      throw new Error('Not authorized');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// GET - Retrieve system roles and statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('👥 [STAFF ROLES] GET request received');

    await connectDB();

    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    try {
      verifyAdminToken(token);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Get role statistics
    const adminCount = await User.countDocuments({ role: 'admin' });
    const memberCount = await User.countDocuments({ role: 'user' });
    const trainerCount = await Trainer.countDocuments({ status: { $ne: 'deleted' } });

    // Define system roles
    const roles = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access - Manage all data, users, bookings, analytics',
        permissions: [
          'manage_members',
          'manage_trainers',
          'manage_bookings',
          'manage_supplements',
          'manage_memberships',
          'manage_transactions',
          'view_analytics',
          'manage_settings',
          'view_login_history',
          'manage_staff_roles',
        ],
        count: adminCount,
        color: '#F4D03F',
        icon: '👨‍💼',
      },
      {
        id: 'trainer',
        name: 'Trainer',
        description: 'Manage member training sessions, view member profiles, create booking',
        permissions: [
          'view_members',
          'manage_bookings',
          'view_member_profiles',
          'create_workout_plans',
          'view_analytics_own',
        ],
        count: trainerCount,
        color: '#4CAF50',
        icon: '💪',
      },
      {
        id: 'member',
        name: 'Member',
        description: 'Manage own profile, book trainers, view workout plans, order supplements',
        permissions: [
          'view_own_profile',
          'view_trainers',
          'book_trainers',
          'view_workout_plans',
          'view_supplements',
          'order_supplements',
          'view_own_bookings',
        ],
        count: memberCount,
        color: '#2196F3',
        icon: '👤',
      },
    ];

    // Get detailed user list by role
    const admins = await User.find({ role: 'admin' })
      .select('firstName lastName email createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    const members = await User.find({ role: 'user' })
      .select('firstName lastName email membershipStatus createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    const trainers = await Trainer.find({ status: { $ne: 'deleted' } })
      .select('name email specialization status createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    console.log(`✅ [STAFF ROLES] Retrieved ${roles.length} roles`);

    return NextResponse.json(
      {
        data: {
          roles,
          users: {
            admins,
            members,
            trainers,
          },
          summary: {
            totalAdmins: adminCount,
            totalMembers: memberCount,
            totalTrainers: trainerCount,
            totalUsers: adminCount + memberCount,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [STAFF ROLES] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

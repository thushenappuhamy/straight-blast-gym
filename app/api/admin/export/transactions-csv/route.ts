export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Trainer } from '@/models/Trainer';
import Booking from '@/models/Booking';
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

// Helper to convert array to CSV
function arrayToCSV(data: any[], headers: string[]): string {
  // Header row
  const csv = [headers.map(h => `"${h}"`).join(',')];
  
  // Data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header.toLowerCase().replace(/ /g, '_')];
      // Escape quotes in fields
      const escaped = String(value || '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csv.push(values.join(','));
  });
  
  return csv.join('\n');
}

// GET - Export transactions as CSV
export async function GET(request: NextRequest) {
  try {

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

    // Fetch all transactional data
    const [members, bookings] = await Promise.all([
      User.find({ role: 'user' }).select('firstName lastName email plan membershipStatus createdAt').lean(),
      Booking.find()
        .populate('memberId', 'firstName lastName email')
        .populate('trainerId', 'name')
        .lean(),
    ]);

    // Prepare transaction data
    const transactions: any[] = [];

    // Process membership transactions
    members.forEach((member) => {
      const planPrices: Record<string, number> = {
        basic: 2500,
        gold: 5000,
        elite: 8000,
      };
      const amount = planPrices[(member.plan || 'basic').toLowerCase()] || 0;
      
      transactions.push({
        id: `MEM-${member._id.toString().slice(-6)}`,
        member: `${member.firstName} ${member.lastName}`,
        email: member.email,
        type: 'Membership',
        amount: amount,
        payment: 'Card',
        date: new Date(member.createdAt).toLocaleDateString('en-US'),
        status: member.membershipStatus || 'active',
        description: `${member.plan?.toUpperCase() || 'BASIC'} Membership`,
      });
    });

    // Process booking transactions
    bookings.forEach((booking) => {
      const memberData = booking.memberId as any;
      const trainerData = booking.trainerId as any;
      
      transactions.push({
        id: `BKG-${booking._id.toString().slice(-6)}`,
        member: memberData?.firstName ? `${memberData.firstName} ${memberData.lastName}` : 'Unknown',
        email: memberData?.email || 'N/A',
        type: 'Trainer Session',
        amount: booking.fee || 0,
        payment: 'Card',
        date: new Date(booking.dateTime).toLocaleDateString('en-US'),
        status: booking.status,
        description: `${booking.type} - ${trainerData?.name || 'Trainer'}`,
      });
    });

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const headers = ['ID', 'Member', 'Email', 'Type', 'Amount', 'Payment', 'Date', 'Status', 'Description'];
    const csv = arrayToCSV(transactions, headers);

    const timestamp = new Date().toISOString().slice(0, 10);
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transactions_${timestamp}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export transactions' },
      { status: 500 }
    );
  }
}

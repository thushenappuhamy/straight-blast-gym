import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { Transaction } from '@/src/models/Transaction';
import { User } from '@/src/models/User';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to verify admin
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded: any = verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const transactions = await Transaction.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { memberId, memberName, type, amount, paymentMethod, date, reference } = body;

    if (!memberId || !memberName || !type || !amount || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const transaction = await Transaction.create({
      memberId,
      memberName,
      type,
      amount,
      paymentMethod,
      date: date ? new Date(date) : new Date(),
      reference,
      status: 'COMPLETED'
    });

    // Update member's membership info if it's a membership payment
    if (type.toLowerCase().includes('membership')) {
      await User.findByIdAndUpdate(memberId, {
        membershipStartDate: date ? new Date(date) : new Date(),
        membershipStatus: 'active'
      });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing ID or status' }, { status: 400 });
    }

    await connectDB();
    const transaction = await Transaction.findByIdAndUpdate(id, { status }, { new: true });

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    // If marked as COMPLETED and is a membership transaction, update user
    if (status === 'COMPLETED' && transaction.type.toLowerCase().includes('membership')) {
      await User.findByIdAndUpdate(transaction.memberId, {
        membershipStartDate: transaction.date || new Date(),
        membershipStatus: 'active'
      });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

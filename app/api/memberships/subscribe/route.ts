export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { User } from '@/src/models/User';
import { Transaction } from '@/src/models/Transaction';
import { Notification } from '@/src/models/Notification';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, paymentMethod, amount } = body;

    if (!plan) {
      return NextResponse.json({ success: false, error: 'No plan selected' }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ success: false, error: 'No payment method selected' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isImmediate = paymentMethod.toLowerCase() === 'card';
    const status = isImmediate ? 'active' : 'pending';
    const txnStatus = isImmediate ? 'COMPLETED' : 'PROCESSING';

    // Update user
    user.plan = plan.toLowerCase();
    user.membershipStatus = status;
    if (isImmediate) {
      user.membershipStartDate = new Date();
    }
    await user.save();

    // Create Transaction
    const transaction = await Transaction.create({
      memberId: user._id,
      memberName: `${user.firstName} ${user.lastName}`,
      type: `${plan.toUpperCase()} Membership Subscription`,
      amount: amount || 0,
      paymentMethod: paymentMethod,
      status: txnStatus,
      date: new Date(),
    });


    // If payment is pending, notify admins
    if (txnStatus === 'PROCESSING') {
      try {
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
          recipientId: admin._id,
          title: 'Action Required: Pending Membership',
          message: `${user.firstName} ${user.lastName} requested a ${plan.toUpperCase()} membership via ${paymentMethod}. Please verify and activate.`,
          type: 'warning',
          link: '/admin/transactions'
        }));
        await Notification.insertMany(notifications);
      } catch (notifyError) {
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        plan: user.plan,
        status: user.membershipStatus,
        transactionId: transaction._id
      },
      message: isImmediate
        ? 'Successfully subscribed to membership plan'
        : 'Subscription request received. Please settle the payment at the gym.'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Supplement from '@/src/models/Supplement';
import { Transaction } from '@/src/models/Transaction';
import { User } from '@/src/models/User';
import { Notification } from '@/src/models/Notification';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {

    await connectDB();

    const authHeader = req.headers.get('authorization');
    let userId = null;
    let userName = 'Guest';

    if (authHeader) {
      try {
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const decoded: any = verify(token, JWT_SECRET);
        userId = decoded.id; // Corrected from userId to id
        const user = await User.findById(userId);
        if (user) {
          userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'User';
        }
      } catch (err) {
      }
    }

    const body = await req.json();
    const { items, shippingDetails, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }


    // Process each item to decrease stock
    const updatePromises = items.map(async (item) => {
      // Find the supplement and ensure it has enough stock
      const supplement = await Supplement.findById(item.id);

      if (!supplement) {
        throw new Error(`Product not found: ${item.name}`);
      }

      if (supplement.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${supplement.stock}`);
      }

      // Decrement stock safely
      supplement.stock -= item.quantity;

      // Auto-update status if stock drops to critical levels
      if (supplement.stock === 0) {
        supplement.status = 'out-of-stock';
      } else if (supplement.stock <= 10) {
        supplement.status = 'low-stock';
      }

      await supplement.save();
      return supplement;
    });

    // Wait for all stock updates to complete
    await Promise.all(updatePromises);

    // Create a transaction record
    if (userId) {
      const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const deliveryCharge = 350;
      const discount = totalAmount * 0.1;
      const finalTotal = totalAmount + deliveryCharge - discount;

      const transaction = await Transaction.create({
        memberId: userId,
        memberName: userName,
        type: 'Supplement Order',
        amount: finalTotal,
        paymentMethod: paymentMethod.toLowerCase() === 'card' ? 'Card' : paymentMethod.toLowerCase() === 'cash' ? 'Cash' : 'PayHere',
        status: paymentMethod.toLowerCase() === 'card' ? 'COMPLETED' : 'PROCESSING',
        date: new Date(),
        reference: `ORD-${Math.random().toString(36).substring(7).toUpperCase()}`
      });

      // If payment is pending, notify admins
      if (transaction.status === 'PROCESSING') {
        try {
          const admins = await User.find({ role: 'admin' });
          const notifications = admins.map(admin => ({
            recipientId: admin._id,
            title: 'New Order: Pending Payment',
            message: `${userName} placed a Supplement Order (LKR ${finalTotal.toLocaleString()}) via ${transaction.paymentMethod}. Please verify payment.`,
            type: 'info',
            link: '/admin/transactions'
          }));
          await Notification.insertMany(notifications);
        } catch (notifyError) {
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: paymentMethod === 'card'
        ? 'Order placed successfully!'
        : 'Order requested! Please contact admin to settle payment.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process checkout' },
      { status: 500 }
    );
  }
}

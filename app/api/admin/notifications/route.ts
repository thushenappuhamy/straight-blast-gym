export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { Notification } from '@/src/models/Notification';
import { User } from '@/src/models/User';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, title, message, type } = body;

    if (!recipientId || !title || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const notification = await Notification.create({
      recipientId,
      title,
      message,
      type: type || 'info',
      status: 'unread'
    });

    return NextResponse.json({ success: true, data: notification });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

async function verifyAdmin(request: NextRequest) {
  let token = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get('authToken')?.value;
  }

  if (!token) return null;

  try {
    await connectDB();
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return null;
    return user;
  } catch (error: any) {
    console.error('❌ [ADMIN API AUTH] Verification failed:', error.message);
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    
    console.log('📝 [PATCH MEMBER] ID:', id, 'Body:', body);

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.error('❌ [PATCH MEMBER] User not found for ID:', id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ [PATCH MEMBER] Success');
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error('❌ [PATCH MEMBER] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

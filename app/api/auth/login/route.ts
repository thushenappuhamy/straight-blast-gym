export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 [LOGIN] Request received");
    console.log("🔐 [LOGIN] JWT_SECRET configured:", !!process.env.JWT_SECRET);
    
    await connectDB();
    console.log("✅ [LOGIN] Database connected");

    const body = await request.json();
    const { email, password } = body;
    
    console.log("📧 [LOGIN] Email:", email);
    console.log("🔑 [LOGIN] Password length:", password?.length);

    // Validation
    if (!email || !password) {
      console.error("❌ [LOGIN] Missing email or password");
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Find user with password (select: false is set on password, so we need to explicitly select it)
    const user = await User.findOne({ email }).select('+password');
    
    console.log("🔍 [LOGIN] User found:", !!user);
    console.log("👤 [LOGIN] User email:", user?.email);
    console.log("👤 [LOGIN] User role:", user?.role);

    if (!user) {
      console.error("❌ [LOGIN] User not found");
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log("🔑 [LOGIN] Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.error("❌ [LOGIN] Invalid password");
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log("🎟️ [LOGIN] Token created");

    // Prepare user response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response = NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: userResponse,
      },
      { status: 200 }
    );

    // Set token as httpOnly cookie
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log("✅ [LOGIN] Response sent successfully");
    return response;
  } catch (error: any) {
    console.error('❌ [LOGIN] Error:', error);
    console.error('❌ [LOGIN] Error message:', error.message);
    console.error('❌ [LOGIN] Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

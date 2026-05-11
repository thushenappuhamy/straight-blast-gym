export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { LoginHistory } from '@/models/LoginHistory';
import { parseUserAgent, getClientIp, getUserAgent } from '@/lib/device-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      console.error("❌ [LOGIN] Missing email or password");
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Extract device and IP information for login history
    const userAgent = getUserAgent(request);
    const { device, browser, os } = parseUserAgent(userAgent);
    const ipAddress = getClientIp(request);

    // Find user with password (select: false is set on password, so we need to explicitly select it)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.error("❌ [LOGIN] User not found");
      
      // Record failed login attempt (user not found)
      try {
        const failedRecord = new LoginHistory({
          userId: null,
          email: email,
          firstName: 'Unknown',
          lastName: 'User',
          role: 'user',
          loginTime: new Date(),
          ipAddress,
          userAgent,
          device,
          browser,
          os,
          status: 'failed',
          failureReason: 'User not found',
        });
        await failedRecord.save();
      } catch (historyError: any) {
        console.warn("⚠️ [LOGIN] Failed to record failed login history:", historyError.message);
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.error("❌ [LOGIN] Invalid password");
      
      // Record failed login attempt (invalid password)
      try {
        const failedRecord = new LoginHistory({
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          loginTime: new Date(),
          ipAddress,
          userAgent,
          device,
          browser,
          os,
          status: 'failed',
          failureReason: 'Invalid password',
        });
        await failedRecord.save();
      } catch (historyError: any) {
        console.warn("⚠️ [LOGIN] Failed to record failed login history:", historyError.message);
      }
      
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

    // Record login history (using device info extracted earlier)
    try {
      const loginRecord = new LoginHistory({
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        loginTime: new Date(),
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        status: 'success',
      });

      await loginRecord.save();
    } catch (historyError: any) {
      console.warn("⚠️ [LOGIN] Failed to record login history:", historyError.message);
      // Don't fail the login if history recording fails
    }

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

    return response;
  } catch (error: any) {
    console.error('❌ [LOGIN] Error:', error);
    console.error('❌ [LOGIN] Error message:', error.message);
    console.error('❌ [LOGIN] Error stack:', error.stack);
    
    // Detect database connection errors
    if (error.message.includes('ENOTFOUND')) {
      console.error('⚠️ MongoDB DNS resolution failed');
      return NextResponse.json(
        { 
          error: 'Database connection failed: MongoDB cluster not found. Check that your cluster exists and the connection string is correct.',
          code: 'DB_DNS_ERROR'
        },
        { status: 503 }
      );
    }
    
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      console.error('⚠️ MongoDB connection timeout');
      return NextResponse.json(
        { 
          error: 'Database connection timeout. The MongoDB cluster may be paused. Try resuming it at cloud.mongodb.com',
          code: 'DB_TIMEOUT'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
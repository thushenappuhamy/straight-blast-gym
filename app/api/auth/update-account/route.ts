export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 [UPDATE ACCOUNT] Request received");

    await connectDB();
    console.log("✅ [UPDATE ACCOUNT] Database connected");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error("❌ [UPDATE ACCOUNT] No token found");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ [UPDATE ACCOUNT] Token verified for user:", decoded.email);
    } catch (error) {
      console.error("❌ [UPDATE ACCOUNT] Invalid token");
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, currentPassword, newPassword, confirmPassword } = body;

    console.log("📧 [UPDATE ACCOUNT] Updating user:", decoded.email);
    console.log("📝 [UPDATE ACCOUNT] Fields to update:", { firstName, lastName, email, changingPassword: !!newPassword });

    // Find user
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      console.error("❌ [UPDATE ACCOUNT] User not found");
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If changing password, verify current password
    if (newPassword) {
      console.log("🔑 [UPDATE ACCOUNT] Validating current password");

      if (!currentPassword) {
        console.error("❌ [UPDATE ACCOUNT] Current password not provided");
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        console.error("❌ [UPDATE ACCOUNT] Current password is incorrect");
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        console.error("❌ [UPDATE ACCOUNT] New passwords do not match");
        return NextResponse.json(
          { error: 'New passwords do not match' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        console.error("❌ [UPDATE ACCOUNT] Password too short");
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      console.log("🔑 [UPDATE ACCOUNT] Password updated");
    }

    // Update personal info
    if (firstName) {
      user.firstName = firstName;
      console.log("📝 [UPDATE ACCOUNT] First name updated:", firstName);
    }

    if (lastName) {
      user.lastName = lastName;
      console.log("📝 [UPDATE ACCOUNT] Last name updated:", lastName);
    }

    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.error("❌ [UPDATE ACCOUNT] Email already in use");
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      user.email = email;
      console.log("📧 [UPDATE ACCOUNT] Email updated:", email);
    }

    // Save user
    await user.save();
    console.log("✅ [UPDATE ACCOUNT] User saved");

    // Prepare response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return NextResponse.json(
      {
        message: 'Account updated successfully',
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [UPDATE ACCOUNT] Error:', error);
    console.error('❌ [UPDATE ACCOUNT] Error message:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

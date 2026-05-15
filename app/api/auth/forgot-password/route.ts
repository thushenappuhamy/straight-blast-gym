export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import { User } from '@/src/models/User';
import crypto from 'crypto';
import { isSmtpConfigured, sendPasswordResetEmail } from '@/src/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Please provide an email' }, { status: 400 });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists for this email, a reset link has been sent.' },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      new URL(req.url).origin;
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    if (!isSmtpConfigured()) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(
          {
            message: 'Password reset link is ready.',
            resetUrl,
          },
          { status: 200 }
        );
      }

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      const errorMessage = String((emailError as Error)?.message || '');
      const isAuthError =
        errorMessage.includes('Invalid login') ||
        String((emailError as any)?.code || '').toUpperCase() === 'EAUTH';

      if (process.env.NODE_ENV !== 'production' && isAuthError) {
        return NextResponse.json(
          {
            message: 'Password reset link is ready.',
            resetUrl,
          },
          { status: 200 }
        );
      }

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw emailError;
    }

    return NextResponse.json(
      { message: 'If an account exists for this email, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error: any) {
    if (String(error?.message || '').includes('Invalid login')) {
      return NextResponse.json(
        { error: 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'There was an error sending the reset email' }, { status: 500 });
  }
}
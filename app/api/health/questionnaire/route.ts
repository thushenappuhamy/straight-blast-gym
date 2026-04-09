import { connectDB } from '@/lib/db';
import { Questionnaire } from '@/models/Questionnaire';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function POST(request: NextRequest) {
  try {
    console.log('📋 [QUESTIONNAIRE] Save request received');

    await connectDB();
    console.log('✅ [QUESTIONNAIRE] Database connected');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error('❌ [QUESTIONNAIRE] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [QUESTIONNAIRE] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [QUESTIONNAIRE] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    console.log('📝 [QUESTIONNAIRE] Saving questionnaire data');

    // Create or update questionnaire
    const questionnaire = await Questionnaire.findOneAndUpdate(
      { userId: decoded.id },
      {
        userId: decoded.id,
        ...body,
      },
      { upsert: true, new: true }
    );

    console.log('✅ [QUESTIONNAIRE] Questionnaire saved');

    return NextResponse.json(
      {
        message: 'Questionnaire saved successfully',
        data: questionnaire,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [QUESTIONNAIRE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [QUESTIONNAIRE] Get request received');

    await connectDB();
    console.log('✅ [QUESTIONNAIRE] Database connected');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error('❌ [QUESTIONNAIRE] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [QUESTIONNAIRE] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [QUESTIONNAIRE] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get questionnaire
    const questionnaire = await Questionnaire.findOne({ userId: decoded.id });

    console.log('✅ [QUESTIONNAIRE] Questionnaire retrieved');

    return NextResponse.json(
      {
        data: questionnaire || null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [QUESTIONNAIRE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

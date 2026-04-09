import { connectDB } from '@/lib/db';
import { PlanQuestionnaire } from '@/models/PlanQuestionnaire';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function POST(request: NextRequest) {
  try {
    console.log('📋 [QUESTIONNAIRE] Request received');

    await connectDB();
    console.log('✅ [QUESTIONNAIRE] Database connected');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error('❌ [QUESTIONNAIRE] No token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [QUESTIONNAIRE] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [QUESTIONNAIRE] Invalid token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📝 [QUESTIONNAIRE] Data received:', body);

    // Create questionnaire record
    const questionnaire = new PlanQuestionnaire({
      userId: decoded.id,
      ...body,
    });

    await questionnaire.save();
    console.log('✅ [QUESTIONNAIRE] Questionnaire saved');

    return NextResponse.json(
      {
        message: 'Questionnaire submitted successfully',
        data: questionnaire,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ [QUESTIONNAIRE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { PlanQuestionnaire } from '@/models/PlanQuestionnaire';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

export async function POST(request: NextRequest) {
  try {

    await connectDB();

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Create questionnaire record
    const questionnaire = new PlanQuestionnaire({
      userId: decoded.id,
      ...body,
    });

    await questionnaire.save();

    return NextResponse.json(
      {
        message: 'Questionnaire submitted successfully',
        data: questionnaire,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

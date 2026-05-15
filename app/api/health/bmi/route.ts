export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { height, weight, gender, dateOfBirth, fitnessGoal } = body;


    // Validate inputs
    if (!height || !weight) {
      return NextResponse.json(
        { error: 'Height and weight are required' },
        { status: 400 }
      );
    }

    // Normalize gender to match schema enum values (capitalize)
    const normalizedGender = gender ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : gender;


    // Calculate BMI: weight (kg) / (height (m) ^ 2)
    const heightInMeters = height / 100;
    const bmiValue = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));


    // Find and update user
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user metrics
    user.bmi = bmiValue;
    user.height = height;
    user.weight = weight;

    if (normalizedGender) user.gender = normalizedGender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (fitnessGoal && Array.isArray(fitnessGoal)) {
      user.fitnessGoal = fitnessGoal;
    }

    await user.save();

    // Determine BMI category
    let category = '';
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue < 25) category = 'Normal Weight';
    else if (bmiValue < 30) category = 'Overweight';
    else category = 'Obese';


    // Calculate recommendations
    const normalWeightMin = Math.round(18.5 * heightInMeters * heightInMeters);
    const normalWeightMax = Math.round(24.9 * heightInMeters * heightInMeters);

    return NextResponse.json(
      {
        message: 'BMI calculated and saved successfully',
        data: {
          bmi: bmiValue,
          category,
          height,
          weight,
          normalWeightRange: `${normalWeightMin} - ${normalWeightMax} kg`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {

    await connectDB();

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    // Determine BMI category
    let category = '';
    if (user.bmi < 18.5) category = 'Underweight';
    else if (user.bmi < 25) category = 'Normal Weight';
    else if (user.bmi < 30) category = 'Overweight';
    else category = 'Obese';

    // Calculate normal weight range
    const heightInMeters = user.height / 100;
    const normalWeightMin = Math.round(18.5 * heightInMeters * heightInMeters);
    const normalWeightMax = Math.round(24.9 * heightInMeters * heightInMeters);

    return NextResponse.json(
      {
        data: {
          bmi: user.bmi || 0,
          height: user.height || 0,
          weight: user.weight || 0,
          category,
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth || '',
          fitnessGoal: user.fitnessGoal || [],
          normalWeightRange: `${normalWeightMin} - ${normalWeightMax} kg`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

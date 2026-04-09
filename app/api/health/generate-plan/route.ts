export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { Questionnaire } from '@/models/Questionnaire';
import { WorkoutPlan } from '@/models/WorkoutPlan';
import { MealPlan } from '@/models/MealPlan';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Initialize Groq API client (using OpenAI SDK with Groq baseURL)
let groq: OpenAI | null = null;
if (GROQ_API_KEY) {
  groq = new OpenAI({
    apiKey: GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

function buildPrompt(questionnaire: any): string {
  return `You are a professional fitness and nutrition coach. Based on the following client questionnaire, create a detailed and professional workout plan and meal plan.

CLIENT PROFILE:
- Name: ${questionnaire.name}
- Age: ${questionnaire.age}
- Height: ${questionnaire.height}cm
- Weight: ${questionnaire.weight}kg
- Dietary Restrictions: ${questionnaire.dietaryRestrictions}
- Food Allergies: ${questionnaire.foodAllergies ? 'Yes - ' + questionnaire.allergiesDescription : 'No'}
- Open to Supplements: ${questionnaire.supplements}
- Exercise Background: ${questionnaire.exerciseBackground.join(', ')}
- Medical Conditions: ${questionnaire.medicalConditions ? 'Yes - ' + questionnaire.medicalDescription : 'No'}
- Commitment Period: ${questionnaire.commitmentPeriod}
- Physical Activity Level: ${questionnaire.physicalActivityLevel}
- Goal: ${questionnaire.goal}
- Protein Preferences: ${questionnaire.proteinSources.join(', ')}
- Carb Preferences: ${questionnaire.carbSources.join(', ')}
- Digestion Issues: ${questionnaire.gerd.join(', ')}
- Diet Commitment: ${questionnaire.dietCommitment}
- Exercise Location: ${questionnaire.exerciseCapability}
- Days/Week Available: ${questionnaire.daysPerWeek}
- Sleep: ${questionnaire.sleepHours}
- Wake Time: ${questionnaire.wakeUpTime}
- Meals Per Day: ${questionnaire.mealsPerDay}
- Exercise Duration: ${questionnaire.exerciseHoursPerDay}

Please provide EXACTLY in this JSON format, no extra text before or after:

{
  "workoutPlan": {
    "title": "Plan title (goal + duration)",
    "goal": "${questionnaire.goal}",
    "level": "Beginner/Intermediate/Advanced (based on background)",
    "duration": "${questionnaire.commitmentPeriod}",
    "frequency": "Days per week (based on days/week)",
    "warmup": "5-10 minute warm-up routine",
    "cooldown": "5-10 minute cool-down routine",
    "progressionStrategy": "How to progress over time",
    "notes": "Important training notes and tips",
    "weeks": [
      {
        "weekNumber": 1,
        "days": [
          {
            "day": "MON",
            "title": "Workout title",
            "duration": "45-60 minutes",
            "focus": ["Muscle group 1", "Muscle group 2"],
            "exercises": [
              {
                "id": "01",
                "exercise": "Exercise name",
                "sets": 3,
                "reps": "8-10",
                "rest": "90s",
                "target": "Muscle Group",
                "notes": "Form tips or modifications"
              }
            ]
          }
        ]
      }
    ]
  },
  "mealPlan": {
    "goal": "${questionnaire.goal}",
    "dietType": "Type based on restrictions",
    "duration": "${questionnaire.commitmentPeriod}",
    "dailyCalories": 2500,
    "protein": 180,
    "carbs": 250,
    "fats": 70,
    "mealsPerDay": ${questionnaire.mealsPerDay || 4},
    "guidelines": ["Guideline 1", "Guideline 2"],
    "mealPrepTips": "Meal prep strategies",
    "hydrationGuidance": "Water intake recommendations",
    "supplements": ["Supplement 1 if open to it"],
    "notes": "Additional nutrition notes",
    "weeklyPlan": [
      {
        "day": "Monday",
        "meals": [
          {
            "mealType": "BREAKFAST",
            "calories": 600,
            "protein": 30,
            "carbs": 70,
            "fats": 15,
            "items": [
              {
                "name": "Food item",
                "quantity": "100g",
                "notes": "Preparation notes"
              }
            ]
          }
        ],
        "dayTotal": {
          "calories": 2450,
          "protein": 165,
          "carbs": 300,
          "fats": 72
        }
      }
    ]
  }
}

Create a professional, detailed plan suitable for immediate use. The workout should have clear progression. The meal plan should be realistic and respect the client's preferences.`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 [PLAN GENERATION] Starting plan generation...');

    await connectDB();
    console.log('✅ [PLAN GENERATION] Database connected');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error('❌ [PLAN GENERATION] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [PLAN GENERATION] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [PLAN GENERATION] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const questionnaire = body;

    console.log('🤖 [PLAN GENERATION] Generating plans with Groq AI...');

    // Check if Groq API key is configured
    if (!groq) {
      console.error('❌ [PLAN GENERATION] Groq API key not configured');
      return NextResponse.json(
        { error: 'Groq API key not configured. Please set GROQ_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Call Groq to generate plans
    const prompt = buildPrompt(questionnaire);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // Lowered temperature to decrease wild schema divergence
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const responseText = response.choices[0].message.content;
    console.log('📬 [PLAN GENERATION] ChatGPT Response received');

    // Parse the JSON response
    let plans;
    try {
      if (!responseText) throw new Error('Empty response');
      console.log('🤖 Raw Response:', responseText.substring(0, 150) + '...');
      plans = JSON.parse(responseText);
    } catch (parseError) {
      try {
        // Fallback: extract JSON if markdown wrappers are present
        const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        plans = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('❌ [PLAN GENERATION] Failed to parse ChatGPT response:', error);
        console.error('❌ [PLAN GENERATION] Flawed Text:', responseText);
        // Fallback response
      plans = {
        workoutPlan: {
          title: 'Default Plan',
          goal: questionnaire.goal,
          level: 'Intermediate',
          duration: questionnaire.commitmentPeriod,
          frequency: questionnaire.daysPerWeek,
          weeks: [],
        },
        mealPlan: {
          goal: questionnaire.goal,
          duration: questionnaire.commitmentPeriod,
          dailyCalories: 2450,
          protein: 165,
          carbs: 300,
          fats: 72,
          mealsPerDay: questionnaire.mealsPerDay || 4,
        },
      };
      }
    }

    // Save Workout Plan
    const workoutPlanData = {
      userId: decoded.id,
      questionnaireId: body._id,
      ...plans.workoutPlan,
    };

    const savedWorkoutPlan = await WorkoutPlan.findOneAndUpdate(
      { userId: decoded.id },
      workoutPlanData,
      { upsert: true, new: true }
    );

    console.log('✅ [PLAN GENERATION] Workout plan saved');

    // Save Meal Plan
    const mealPlanData = {
      userId: decoded.id,
      questionnaireId: body._id,
      ...plans.mealPlan,
    };

    const savedMealPlan = await MealPlan.findOneAndUpdate(
      { userId: decoded.id },
      mealPlanData,
      { upsert: true, new: true }
    );

    console.log('✅ [PLAN GENERATION] Meal plan saved');

    return NextResponse.json(
      {
        message: 'Plans generated successfully',
        data: {
          workoutPlan: savedWorkoutPlan,
          mealPlan: savedMealPlan,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [PLAN GENERATION] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate plans',
        details: error.error?.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [PLAN GENERATION] Get request received');

    await connectDB();
    console.log('✅ [PLAN GENERATION] Database connected');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.error('❌ [PLAN GENERATION] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [PLAN GENERATION] Token verified for user:', decoded.email);
    } catch (error) {
      console.error('❌ [PLAN GENERATION] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get both plans
    const workoutPlan = await WorkoutPlan.findOne({ userId: decoded.id });
    const mealPlan = await MealPlan.findOne({ userId: decoded.id });

    console.log('✅ [PLAN GENERATION] Plans retrieved');

    return NextResponse.json(
      {
        data: {
          workoutPlan: workoutPlan || null,
          mealPlan: mealPlan || null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [PLAN GENERATION] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { Questionnaire } from '@/models/Questionnaire';
import { WorkoutPlan } from '@/models/WorkoutPlan';
import { MealPlan } from '@/models/MealPlan';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

// Function to determine fitness level from questionnaire answers
function determineFitnessLevel(questionnaire: any): string {
  let advancedIndicators = 0;
  let intermediateIndicators = 0;

  if (questionnaire.physicalActivityLevel) {
    if (questionnaire.physicalActivityLevel === 'SignificantExercise') {
      advancedIndicators += 3;
    } else if (questionnaire.physicalActivityLevel === 'ModerateExercise') {
      intermediateIndicators += 2;
    } else if (questionnaire.physicalActivityLevel === 'MildExercise') {
      intermediateIndicators += 1;
    }
  }

  if (questionnaire.exerciseBackground && Array.isArray(questionnaire.exerciseBackground)) {
    if (questionnaire.exerciseBackground.includes('Athlete')) {
      advancedIndicators += 3;
    } else if (questionnaire.exerciseBackground.includes('Very Active')) {
      advancedIndicators += 2;
    } else if (questionnaire.exerciseBackground.includes('Moderate Activity')) {
      intermediateIndicators += 2;
    }
  }

  if (questionnaire.daysPerWeek >= 5) {
    advancedIndicators += 2;
  } else if (questionnaire.daysPerWeek >= 3) {
    intermediateIndicators += 1;
  }

  if (questionnaire.exerciseCapability === 'gym') {
    intermediateIndicators += 1;
  } else if (questionnaire.exerciseCapability === 'both') {
    advancedIndicators += 1;
  }

  if (!questionnaire.medicalConditions) {
    intermediateIndicators += 1;
  }

  if (questionnaire.commitmentPeriod === '16-weeks') {
    advancedIndicators += 1;
  }

  if (advancedIndicators >= 4) {
    return 'Advanced';
  } else if (intermediateIndicators >= 3 || advancedIndicators >= 2) {
    return 'Intermediate';
  } else {
    return 'Beginner';
  }
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

    console.log('🤖 [PLAN GENERATION] Generating personalized plans...');

    const fitnessLevel = determineFitnessLevel(questionnaire);
    const mealsPerDay = questionnaire.mealsPerDay || 4;
    const daysPerWeek = questionnaire.daysPerWeek || 3;

    // Predefined exercise library - completely different exercises for each day
    const exerciseLibrary = [
      ['Barbell Back Squat', 'Bench Press', 'Barbell Bent Rows', 'Military Press', 'Tricep Dips', 'Barbell Curls'],
      ['Leg Press', 'Dumbbell Bench Press', 'Lat Pulldowns', 'Dumbbell Shoulder Press', 'Rope Pushdowns', 'Dumbbell Curls'],
      ['Goblet Squats', 'Machine Chest Press', 'Machine Rows', 'Pike Pushups', 'Tricep Extensions', 'EZ-Bar Curls'],
      ['Leg Extensions', 'Incline Bench Press', 'Assisted Pullups', 'Cable Shoulder Press', 'Bench Dips', 'Machine Curls'],
    ];

    // Meal types
    const mealTypes: any = {
      2: ['Breakfast', 'Dinner'],
      3: ['Breakfast', 'Lunch', 'Dinner'],
      4: ['Breakfast', 'Snack', 'Lunch', 'Dinner'],
      5: ['Breakfast', 'Snack', 'Lunch', 'Afternoon Snack', 'Dinner'],
      6: ['Breakfast', 'Snack', 'Lunch', 'Afternoon Snack', 'Pre-Workout', 'Dinner'],
    };

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mealsForPlan = mealTypes[mealsPerDay] || mealTypes[4];

    // Build workout plan with completely different exercises per day
    const workoutDays: any = [];
    for (let i = 0; i < daysPerWeek && i < dayNames.length; i++) {
      const exercises: any = [];
      const exerciseSet = exerciseLibrary[i % exerciseLibrary.length];
      
      for (const exerciseName of exerciseSet) {
        exercises.push({
          exercise: exerciseName,
          sets: fitnessLevel === 'Beginner' ? 3 : fitnessLevel === 'Intermediate' ? 4 : 5,
          reps: fitnessLevel === 'Beginner' ? '12-15' : fitnessLevel === 'Intermediate' ? '8-12' : '6-10',
          rest: fitnessLevel === 'Beginner' ? '60-90s' : fitnessLevel === 'Intermediate' ? '90-120s' : '120-180s',
          target: ['Legs', 'Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'][exerciseSet.indexOf(exerciseName)],
        });
      }

      workoutDays.push({
        day: dayNames[i],
        title: `Day ${i + 1} Workout`,
        duration: fitnessLevel === 'Beginner' ? '45-60 min' : fitnessLevel === 'Intermediate' ? '60-75 min' : '75-90 min',
        exercises: exercises,
      });
    }

    // Build meal plan with exactly the right number of meals
    const meals: any = [];
    for (let i = 0; i < mealsPerDay; i++) {
      meals.push({
        mealType: mealsForPlan[i],
        calories: Math.floor(2500 / mealsPerDay),
        protein: Math.floor((180 / mealsPerDay) * 10) / 10,
        carbs: Math.floor((275 / mealsPerDay) * 10) / 10,
        fats: Math.floor((83 / mealsPerDay) * 10) / 10,
        items: [{name: 'Food Item 1', quantity: '100g'}, {name: 'Food Item 2', quantity: '100g'}],
      });
    }

    // Create plans object
    const plans = {
      workoutPlan: {
        title: `${questionnaire.goal} - ${fitnessLevel}`,
        goal: questionnaire.goal,
        level: fitnessLevel,
        duration: questionnaire.commitmentPeriod,
        frequency: `${daysPerWeek} days/week`,
        weeks: [
          {
            week: 'Week 1',
            days: workoutDays,
          },
        ],
      },
      mealPlan: {
        goal: questionnaire.goal,
        mealsPerDay: mealsPerDay,
        dailyCalories: 2500,
        protein: 180,
        carbs: 275,
        fats: 83,
        weeklyPlan: [
          {
            day: 'Monday',
            meals: meals,
            dayTotal: {
              calories: 2500,
              protein: 180,
              carbs: 275,
              fats: 83,
            },
          },
        ],
      },
    };

    console.log('✅ [PLAN GENERATION] Plans generated successfully');
    console.log(`   - Fitness Level: ${fitnessLevel}`);
    console.log(`   - Workout days: ${workoutDays.length}`);
    console.log(`   - Meals per day: ${mealsPerDay}`);

    // Save Workout Plan
    const workoutPlanData = {
      userId: decoded.id,
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
        message: 'Plans retrieved successfully',
        data: {
          workoutPlan,
          mealPlan,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [PLAN GENERATION] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to retrieve plans',
      },
      { status: 500 }
    );
  }
}

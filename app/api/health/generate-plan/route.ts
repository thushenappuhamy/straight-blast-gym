export const dynamic = "force-dynamic";

import { connectDB } from '@/lib/db';
import { Questionnaire } from '@/models/Questionnaire';
import { WorkoutPlan } from '@/models/WorkoutPlan';
import { MealPlan } from '@/models/MealPlan';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

type GeneratedPlans = {
  workoutPlan: any;
  mealPlan: any;
};

type ValidationIssue = {
  path: string;
  message: string;
};

function logAiEvent(event: string, payload: Record<string, unknown>) {
  console.log(`🤖 [PLAN GENERATION] ${event}`, payload);
}

function validatePlansShape(plans: GeneratedPlans): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!plans.workoutPlan?.weeks?.length) {
    issues.push({ path: 'workoutPlan.weeks', message: 'Expected at least one week' });
  }

  if (!plans.mealPlan?.weeks?.length) {
    issues.push({ path: 'mealPlan.weeks', message: 'Expected at least one week' });
  }

  const workoutDays = plans.workoutPlan?.weeks?.[0]?.days || [];
  if (workoutDays.length === 0) {
    issues.push({ path: 'workoutPlan.weeks[0].days', message: 'Expected at least one workout day' });
  }

  const mealDays = plans.mealPlan?.weeks?.[0]?.days || [];
  if (mealDays.length === 0) {
    issues.push({ path: 'mealPlan.weeks[0].days', message: 'Expected at least one meal day' });
  }

  if (workoutDays.some((day: any) => !day.exercises || day.exercises.length === 0)) {
    issues.push({ path: 'workoutPlan.weeks[0].days[].exercises', message: 'Each day should include exercises' });
  }

  if (mealDays.some((day: any) => !day.meals || day.meals.length === 0)) {
    issues.push({ path: 'mealPlan.weeks[0].days[].meals', message: 'Each day should include meals' });
  }

  return issues;
}

function extractJsonBlock(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function normalizeText(value: any) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\s\u00A0]+/g, ' ')
    .trim();
}

function isYesLike(value: any) {
  if (value === true) {
    return true;
  }

  const normalized = normalizeText(value);
  return normalized === 'yes' || normalized === 'true' || normalized.includes('yes');
}

function hasDigestiveIssue(questionnaire: any) {
  const gerdText = Array.isArray(questionnaire.gerd) ? questionnaire.gerd.map(normalizeText).join(' ') : '';
  const gastroText = normalizeText(questionnaire.gastroproblem);

  return gerdText.includes('acid') || gerdText.includes('bloating') || gastroText.includes('acid') || gastroText.includes('bloating');
}

function getTrainingDays(questionnaire: any): number {
  const rawValue = questionnaire.daysPerWeek ?? questionnaire.exerciseDaysPerWeek;

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return Math.max(1, Math.round(rawValue));
  }

  const normalized = normalizeText(rawValue);

  if (!normalized) {
    return 3;
  }

  if (normalized.includes('6')) {
    return 6;
  }

  if (normalized.includes('4')) {
    return 4;
  }

  if (normalized.includes('3')) {
    return 3;
  }

  if (normalized.includes('1-2') || normalized.includes('1 to 2')) {
    return 2;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? Math.max(1, parsed) : 3;
}

function determineFitnessGoal(questionnaire: any): 'Weight Loss' | 'Maintenance' | 'Bulking' | 'Lean Physique' {
  const goalText = normalizeText(questionnaire.goal || questionnaire.fitnessGoals?.[0]);

  if (goalText.includes('weight loss') || goalText.includes('lose')) {
    return 'Weight Loss';
  }

  if (goalText.includes('bulking') || goalText.includes('gain muscle') || goalText.includes('muscle gain')) {
    return 'Bulking';
  }

  if (goalText.includes('lean') || goalText.includes('physique') || goalText.includes('aesthetic')) {
    return 'Lean Physique';
  }

  return 'Maintenance';
}

function determineWorkoutEnvironment(questionnaire: any): 'home' | 'gym' | 'mixed' {
  const rawCapability = normalizeText(questionnaire.exerciseCapability || questionnaire.exerciseLocation);

  if (rawCapability.includes('gym')) {
    return rawCapability.includes('home') ? 'mixed' : 'gym';
  }

  if (rawCapability.includes('mixed') || rawCapability.includes('both') || rawCapability.includes('outdoor')) {
    return 'mixed';
  }

  if (rawCapability.includes('home')) {
    return 'home';
  }

  return 'mixed';
}

function determineFitnessLevel(questionnaire: any): string {
  let score = 0;

  const activityLevel = normalizeText(questionnaire.physicalActivityLevel);
  if (activityLevel.includes('significant')) {
    score += 3;
  } else if (activityLevel.includes('moderate')) {
    score += 2;
  } else if (activityLevel.includes('mild')) {
    score += 1;
  }

  const background = Array.isArray(questionnaire.exerciseBackground)
    ? questionnaire.exerciseBackground.map(normalizeText)
    : [];

  if (background.some((item: string) => item.includes('gym') || item.includes('resistance') || item.includes('weight'))) {
    score += 3;
  }

  if (background.some((item: string) => item.includes('running') || item.includes('jogging') || item.includes('cycling'))) {
    score += 1;
  }

  if (background.some((item: string) => item.includes('yoga') || item.includes('pilates'))) {
    score += 1;
  }

  const daysPerWeek = getTrainingDays(questionnaire);
  if (daysPerWeek >= 6) {
    score += 3;
  } else if (daysPerWeek >= 4) {
    score += 2;
  } else if (daysPerWeek >= 3) {
    score += 1;
  }

  const environment = determineWorkoutEnvironment(questionnaire);
  if (environment === 'gym') {
    score += 1;
  } else if (environment === 'mixed') {
    score += 2;
  }

  const commitmentPeriod = normalizeText(questionnaire.commitmentPeriod);
  if (commitmentPeriod.includes('12') || commitmentPeriod.includes('6')) {
    score += 1;
  }

  if (isYesLike(questionnaire.medicalConditions)) {
    score -= 1;
  }

  if (score >= 7) {
    return 'Advanced';
  }

  if (score >= 3) {
    return 'Intermediate';
  }

  return 'Beginner';
}

function getWorkoutSplit(level: string, daysPerWeek: number) {
  if (level === 'Beginner') {
    return Array.from({ length: daysPerWeek }, (_, index) => ({
      type: 'full-body',
      title: `Full Body ${String.fromCharCode(65 + index)}`,
      focus: ['Legs', 'Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'],
    }));
  }

  if (daysPerWeek >= 6) {
    return [
      { type: 'push', title: 'Push Day', focus: ['Chest', 'Shoulders', 'Triceps'] },
      { type: 'pull', title: 'Pull Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
      { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
      { type: 'push', title: 'Push Day 2', focus: ['Chest', 'Shoulders', 'Triceps'] },
      { type: 'pull', title: 'Pull Day 2', focus: ['Back', 'Rear Delts', 'Biceps'] },
      { type: 'legs', title: 'Leg Day 2', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
    ];
  }

  if (daysPerWeek === 5) {
    if (level === 'Advanced') {
      return [
        { type: 'chest', title: 'Chest Day', focus: ['Chest', 'Shoulders', 'Triceps'] },
        { type: 'back', title: 'Back Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
        { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
        { type: 'shoulders', title: 'Shoulders Day', focus: ['Shoulders', 'Upper Chest', 'Triceps'] },
        { type: 'arms', title: 'Arms Day', focus: ['Biceps', 'Triceps', 'Forearms'] },
      ];
    }

    return [
      { type: 'upper', title: 'Upper Body Day', focus: ['Chest', 'Back', 'Shoulders', 'Arms'] },
      { type: 'lower', title: 'Lower Body Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
      { type: 'push', title: 'Push Day', focus: ['Chest', 'Shoulders', 'Triceps'] },
      { type: 'pull', title: 'Pull Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
      { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
    ];
  }

  if (daysPerWeek === 4) {
    return [
      { type: 'upper', title: 'Upper Body Day', focus: ['Chest', 'Back', 'Shoulders', 'Arms'] },
      { type: 'lower', title: 'Lower Body Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
      { type: 'upper', title: 'Upper Body Day 2', focus: ['Chest', 'Back', 'Shoulders', 'Arms'] },
      { type: 'lower', title: 'Lower Body Day 2', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
    ];
  }

  return [
    { type: 'push', title: 'Push Day', focus: ['Chest', 'Shoulders', 'Triceps'] },
    { type: 'pull', title: 'Pull Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
    { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
  ].slice(0, daysPerWeek);
}

const EXERCISE_LIBRARY: Record<string, Record<string, string[]>> = {
  home: {
    Legs: ['Goblet Squat', 'Bulgarian Split Squat', 'Reverse Lunge', 'Step-Up'],
    Chest: ['Incline Push-Up', 'Push-Up', 'Dumbbell Floor Press', 'Band Chest Press'],
    Back: ['One-Arm Dumbbell Row', 'Band Row', 'Chest-Supported Dumbbell Row', 'Superman Row'],
    Shoulders: ['Dumbbell Overhead Press', 'Pike Push-Up', 'Lateral Raise', 'Arnold Press'],
    Triceps: ['Bench Dip', 'Overhead Dumbbell Extension', 'Diamond Push-Up', 'Close-Grip Push-Up'],
    Biceps: ['Dumbbell Curl', 'Hammer Curl', 'Band Curl', 'Zottman Curl'],
    Quads: ['Goblet Squat', 'Split Squat', 'Step-Up', 'Wall Sit'],
    Hamstrings: ['Romanian Deadlift', 'Single-Leg RDL', 'Hip Hinge Good Morning', 'Glute Bridge Walkout'],
    Glutes: ['Hip Thrust', 'Glute Bridge', 'Single-Leg Glute Bridge', 'Donkey Kick'],
    Calves: ['Standing Calf Raise', 'Single-Leg Calf Raise', 'Tempo Calf Raise', 'Bent-Knee Calf Raise'],
    Core: ['Plank', 'Dead Bug', 'Hollow Hold', 'Bird Dog'],
    'Rear Delts': ['Band Face Pull', 'Reverse Fly', 'Prone Y Raise', 'Band Pull-Apart'],
    'Upper Chest': ['Incline Push-Up', 'Feet-Elevated Push-Up', 'Low-Incline Dumbbell Press', 'Band Incline Press'],
    Arms: ['Close-Grip Push-Up', 'Dumbbell Curl', 'Bench Dip', 'Hammer Curl'],
    Forearms: ['Towel Hold', 'Farmer Carry', 'Wrist Curl', 'Reverse Curl'],
  },
  mixed: {
    Legs: ['Goblet Squat', 'Leg Press', 'Bulgarian Split Squat', 'Walking Lunge'],
    Chest: ['Dumbbell Bench Press', 'Incline Dumbbell Press', 'Machine Chest Press', 'Push-Up'],
    Back: ['Lat Pulldown', 'Seated Cable Row', 'Chest-Supported Row', 'Single-Arm Dumbbell Row'],
    Shoulders: ['Seated Dumbbell Press', 'Machine Shoulder Press', 'Lateral Raise', 'Face Pull'],
    Triceps: ['Cable Pushdown', 'Overhead Rope Extension', 'Assisted Dip', 'Skull Crusher'],
    Biceps: ['EZ-Bar Curl', 'Incline Dumbbell Curl', 'Hammer Curl', 'Cable Curl'],
    Quads: ['Leg Press', 'Front Squat', 'Walking Lunge', 'Leg Extension'],
    Hamstrings: ['Romanian Deadlift', 'Seated Leg Curl', 'Lying Leg Curl', 'Dumbbell RDL'],
    Glutes: ['Hip Thrust', 'Cable Pull-Through', 'Glute Bridge', 'Bulgarian Split Squat'],
    Calves: ['Standing Calf Raise', 'Seated Calf Raise', 'Single-Leg Calf Raise', 'Press Calf Raise'],
    Core: ['Cable Crunch', 'Pallof Press', 'Hanging Knee Raise', 'Ab Wheel Rollout'],
    'Rear Delts': ['Face Pull', 'Reverse Pec Deck', 'Rear Delt Fly', 'Cable Rear Delt Row'],
    'Upper Chest': ['Incline Dumbbell Press', 'Incline Machine Press', 'Low-Incline Barbell Press', 'Incline Cable Fly'],
    Arms: ['Cable Curl', 'Rope Pushdown', 'EZ-Bar Curl', 'Overhead Rope Extension'],
    Forearms: ['Farmer Carry', 'Reverse Curl', 'Wrist Curl', 'Cable Wrist Extension'],
  },
  gym: {
    Legs: ['Barbell Back Squat', 'Front Squat', 'Leg Press', 'Hack Squat'],
    Chest: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Bench Press', 'Machine Chest Press'],
    Back: ['Barbell Row', 'Lat Pulldown', 'Chest-Supported Row', 'Seated Cable Row'],
    Shoulders: ['Barbell Overhead Press', 'Seated Dumbbell Press', 'Machine Shoulder Press', 'Lateral Raise'],
    Triceps: ['Cable Pushdown', 'Skull Crusher', 'Overhead Rope Extension', 'Weighted Dip'],
    Biceps: ['EZ-Bar Curl', 'Incline Dumbbell Curl', 'Cable Curl', 'Preacher Curl'],
    Quads: ['Back Squat', 'Leg Press', 'Hack Squat', 'Leg Extension'],
    Hamstrings: ['Romanian Deadlift', 'Seated Leg Curl', 'Lying Leg Curl', 'Good Morning'],
    Glutes: ['Hip Thrust', 'Cable Pull-Through', 'Bulgarian Split Squat', 'Smith Machine Glute Bridge'],
    Calves: ['Standing Calf Raise', 'Seated Calf Raise', 'Leg Press Calf Raise', 'Donkey Calf Raise'],
    Core: ['Cable Crunch', 'Hanging Leg Raise', 'Ab Wheel Rollout', 'Pallof Press'],
    'Rear Delts': ['Face Pull', 'Reverse Pec Deck', 'Rear Delt Cable Fly', 'Bent-Over Reverse Fly'],
    'Upper Chest': ['Incline Bench Press', 'Incline Dumbbell Press', 'Low-Incline Smith Press', 'Incline Cable Fly'],
    Arms: ['EZ-Bar Curl', 'Cable Pushdown', 'Preacher Curl', 'Overhead Rope Extension'],
    Forearms: ['Farmer Carry', 'Reverse Curl', 'Wrist Curl', 'Plate Pinch Hold'],
  },
};

type ExerciseCategory = 'compound' | 'accessory';

function getExerciseName(environment: 'home' | 'gym' | 'mixed', target: string, dayIndex: number, exerciseIndex: number, seed: number) {
  const options = EXERCISE_LIBRARY[environment][target] || EXERCISE_LIBRARY.mixed[target] || EXERCISE_LIBRARY.gym[target] || [target];
  return options[(dayIndex + exerciseIndex + seed) % options.length];
}

function buildExercise({
  environment,
  target,
  category,
  level,
  dayIndex,
  exerciseIndex,
  seed,
}: {
  environment: 'home' | 'gym' | 'mixed';
  target: string;
  category: ExerciseCategory;
  level: string;
  dayIndex: number;
  exerciseIndex: number;
  seed: number;
}) {
  const progressive = {
    Beginner: {
      compound: { sets: 3, reps: '10-12', rest: '60-90s' },
      accessory: { sets: 2, reps: '12-15', rest: '45-60s' },
    },
    Intermediate: {
      compound: { sets: 4, reps: '6-10', rest: '90-120s' },
      accessory: { sets: 3, reps: '10-12', rest: '60-90s' },
    },
    Advanced: {
      compound: { sets: 5, reps: '4-8', rest: '120-180s' },
      accessory: { sets: 4, reps: '8-15', rest: '60-90s' },
    },
  } as const;

  const progression = progressive[level as keyof typeof progressive] || progressive.Intermediate;
  const exerciseName = getExerciseName(environment, target, dayIndex, exerciseIndex, seed);

  return {
    id: crypto.randomUUID(),
    name: exerciseName,
    exercise: exerciseName,
    sets: progression[category].sets,
    reps: progression[category].reps,
    rest: progression[category].rest,
    target,
    notes:
      level === 'Beginner'
        ? 'Use controlled tempo and stop 2-3 reps before failure.'
        : level === 'Intermediate'
          ? 'Add load when the top of the rep range feels solid.'
          : 'Use progressive overload and keep 1-2 reps in reserve on working sets.',
  };
}

function buildWorkoutDay(
  dayType: string,
  environment: 'home' | 'gym' | 'mixed',
  level: string,
  dayIndex: number,
  seed: number
) {
  const dayBlueprints: Record<string, Array<{ target: string; category: ExerciseCategory }>> = {
    'full-body': [
      { target: 'Legs', category: 'compound' },
      { target: 'Chest', category: 'compound' },
      { target: 'Back', category: 'compound' },
      { target: 'Shoulders', category: 'accessory' },
      { target: 'Triceps', category: 'accessory' },
      { target: 'Biceps', category: 'accessory' },
    ],
    push: [
      { target: 'Chest', category: 'compound' },
      { target: 'Chest', category: 'accessory' },
      { target: 'Shoulders', category: 'compound' },
      { target: 'Shoulders', category: 'accessory' },
      { target: 'Triceps', category: 'compound' },
      { target: 'Triceps', category: 'accessory' },
    ],
    pull: [
      { target: 'Back', category: 'compound' },
      { target: 'Back', category: 'accessory' },
      { target: 'Rear Delts', category: 'accessory' },
      { target: 'Biceps', category: 'compound' },
      { target: 'Biceps', category: 'accessory' },
    ],
    legs: [
      { target: 'Quads', category: 'compound' },
      { target: 'Hamstrings', category: 'compound' },
      { target: 'Glutes', category: 'compound' },
      { target: 'Quads', category: 'accessory' },
      { target: 'Calves', category: 'accessory' },
      { target: 'Core', category: 'accessory' },
    ],
    upper: [
      { target: 'Chest', category: 'compound' },
      { target: 'Back', category: 'compound' },
      { target: 'Shoulders', category: 'compound' },
      { target: 'Chest', category: 'accessory' },
      { target: 'Back', category: 'accessory' },
      { target: 'Arms', category: 'accessory' },
    ],
    lower: [
      { target: 'Quads', category: 'compound' },
      { target: 'Hamstrings', category: 'compound' },
      { target: 'Glutes', category: 'compound' },
      { target: 'Calves', category: 'accessory' },
      { target: 'Core', category: 'accessory' },
      { target: 'Quads', category: 'accessory' },
    ],
    chest: [
      { target: 'Chest', category: 'compound' },
      { target: 'Chest', category: 'accessory' },
      { target: 'Upper Chest', category: 'compound' },
      { target: 'Shoulders', category: 'accessory' },
      { target: 'Triceps', category: 'compound' },
      { target: 'Triceps', category: 'accessory' },
    ],
    back: [
      { target: 'Back', category: 'compound' },
      { target: 'Back', category: 'accessory' },
      { target: 'Rear Delts', category: 'accessory' },
      { target: 'Biceps', category: 'compound' },
      { target: 'Biceps', category: 'accessory' },
      { target: 'Core', category: 'accessory' },
    ],
    shoulders: [
      { target: 'Shoulders', category: 'compound' },
      { target: 'Shoulders', category: 'accessory' },
      { target: 'Upper Chest', category: 'compound' },
      { target: 'Rear Delts', category: 'accessory' },
      { target: 'Triceps', category: 'compound' },
      { target: 'Core', category: 'accessory' },
    ],
    arms: [
      { target: 'Triceps', category: 'compound' },
      { target: 'Biceps', category: 'compound' },
      { target: 'Triceps', category: 'accessory' },
      { target: 'Biceps', category: 'accessory' },
      { target: 'Forearms', category: 'accessory' },
      { target: 'Core', category: 'accessory' },
    ],
  };

  const blueprint = dayBlueprints[dayType] || dayBlueprints['full-body'];
  const exercises = blueprint.map((item, exerciseIndex) => buildExercise({
    environment,
    target: item.target,
    category: item.category,
    level,
    dayIndex,
    exerciseIndex,
    seed,
  }));

  const durationByLevel = level === 'Beginner' ? '45-60 min' : level === 'Intermediate' ? '60-75 min' : '75-90 min';

  return {
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex] || `Day ${dayIndex + 1}`,
    title: `${dayType === 'full-body' ? 'Full Body' : dayType.charAt(0).toUpperCase() + dayType.slice(1)} Workout`,
    duration: durationByLevel,
    focus: dayType === 'full-body' ? ['Full Body', 'Mobility', 'Stability'] : blueprint.map((item) => item.target),
    exercises,
  };
}

function getActivityMultiplier(questionnaire: any) {
  const activityLevel = normalizeText(questionnaire.physicalActivityLevel);

  if (activityLevel.includes('significant') || activityLevel.includes('intense')) {
    return 1.725;
  }

  if (activityLevel.includes('moderate')) {
    return 1.55;
  }

  if (activityLevel.includes('mild')) {
    return 1.375;
  }

  return 1.2;
}

function getBmr(questionnaire: any) {
  const weightKg = Number(questionnaire.weight) || 70;
  const heightCm = Number(questionnaire.height) || 170;
  const age = Number(questionnaire.age) || 25;
  const gender = normalizeText(questionnaire.gender || questionnaire.sex);

  if (gender.startsWith('m')) {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }

  if (gender.startsWith('f')) {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  return 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
}

function getTdee(questionnaire: any) {
  return Math.round(getBmr(questionnaire) * getActivityMultiplier(questionnaire));
}

function getPlanSeed(questionnaire: any) {
  const seedSource = [
    questionnaire.gender,
    questionnaire.age,
    questionnaire.height,
    questionnaire.weight,
    questionnaire.goal,
    questionnaire.commitmentPeriod,
    questionnaire.physicalActivityLevel,
    questionnaire.daysPerWeek ?? questionnaire.exerciseDaysPerWeek,
    questionnaire.exerciseCapability || questionnaire.exerciseLocation,
    questionnaire.dietaryRestrictions,
  ]
    .map((value) => normalizeText(value))
    .join('|');

  let hash = 0;
  for (let index = 0; index < seedSource.length; index += 1) {
    hash = (hash * 31 + seedSource.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getDailyCalories(questionnaire: any, goal: string) {
  const tdee = getTdee(questionnaire);

  if (goal === 'Weight Loss') {
    return Math.max(1200, tdee - 500);
  }

  if (goal === 'Bulking') {
    return tdee + 500;
  }

  return tdee;
}

function getMacroTargets(goal: string, weightKg: number, calories: number) {
  let proteinPerKg = 1.8;
  let fatPerKg = 0.8;

  if (goal === 'Weight Loss') {
    proteinPerKg = 2.0;
    fatPerKg = 0.75;
  } else if (goal === 'Bulking') {
    proteinPerKg = 1.9;
    fatPerKg = 0.9;
  } else if (goal === 'Lean Physique') {
    proteinPerKg = 2.0;
    fatPerKg = 0.8;
  }

  const protein = Math.round(weightKg * proteinPerKg);
  const fats = Math.round(weightKg * fatPerKg);
  const remainingCalories = calories - protein * 4 - fats * 9;
  const carbs = Math.max(90, Math.round(remainingCalories / 4));

  return { protein, carbs, fats };
}

function getDietType(questionnaire: any) {
  const restriction = normalizeText(questionnaire.dietaryRestrictions);

  if (restriction.includes('vegan')) {
    return 'Vegan';
  }

  if (restriction.includes('vegetarian')) {
    return 'Vegetarian';
  }

  if (restriction.includes('pescatarian')) {
    return 'Pescatarian';
  }

  if (restriction.includes('no red meat') || restriction.includes('no-red-meat')) {
    return 'No Red Meat';
  }

  return 'No Restrictions';
}

function getMealSlotNames(mealsPerDay: number) {
  const slots: Record<number, string[]> = {
    2: ['Breakfast', 'Dinner'],
    3: ['Breakfast', 'Lunch', 'Dinner'],
    4: ['Breakfast', 'Snack', 'Lunch', 'Dinner'],
    5: ['Breakfast', 'Snack', 'Lunch', 'Afternoon Snack', 'Dinner'],
    6: ['Breakfast', 'Snack', 'Lunch', 'Afternoon Snack', 'Pre-Workout', 'Dinner'],
  };

  return slots[mealsPerDay] || slots[4];
}

function getMealMacroWeights(mealsPerDay: number) {
  const weights: Record<number, number[]> = {
    2: [0.45, 0.55],
    3: [0.3, 0.35, 0.35],
    4: [0.25, 0.15, 0.3, 0.3],
    5: [0.25, 0.1, 0.25, 0.1, 0.3],
    6: [0.22, 0.08, 0.25, 0.08, 0.12, 0.25],
  };

  return weights[mealsPerDay] || weights[4];
}

function buildMealItems(dietType: string, slot: string, dayIndex: number, goal: string, seed: number) {
  const banks: Record<string, Record<string, Array<Array<{ item: string; quantity: string }>>>> = {
    'No Restrictions': {
      Breakfast: [
        [{ item: 'Oats', quantity: '80g' }, { item: 'Eggs', quantity: '3 large' }, { item: 'Banana', quantity: '1 medium' }],
        [{ item: 'Greek yogurt', quantity: '250g' }, { item: 'Granola', quantity: '40g' }, { item: 'Berries', quantity: '1 cup' }],
        [{ item: 'Whole grain toast', quantity: '2 slices' }, { item: 'Scrambled eggs', quantity: '3 eggs' }, { item: 'Avocado', quantity: '1/2 fruit' }],
      ],
      Lunch: [
        [{ item: 'Chicken breast', quantity: '180g' }, { item: 'Rice', quantity: '1.5 cups' }, { item: 'Mixed vegetables', quantity: '1 cup' }],
        [{ item: 'Turkey wrap', quantity: '1 large wrap' }, { item: 'Salad greens', quantity: '2 cups' }, { item: 'Olive oil dressing', quantity: '1 tbsp' }],
        [{ item: 'Lean beef stir fry', quantity: '180g' }, { item: 'Jasmine rice', quantity: '1.5 cups' }, { item: 'Broccoli', quantity: '1 cup' }],
      ],
      Dinner: [
        [{ item: 'Salmon', quantity: '180g' }, { item: 'Sweet potato', quantity: '250g' }, { item: 'Asparagus', quantity: '1 cup' }],
        [{ item: 'Chicken pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }, { item: 'Olive oil', quantity: '1 tbsp' }],
        [{ item: 'Egg fried rice', quantity: '2 cups' }, { item: 'Stir-fried vegetables', quantity: '1.5 cups' }, { item: 'Sesame seeds', quantity: '1 tbsp' }],
      ],
      Snack: [
        [{ item: 'Protein shake', quantity: '1 serving' }, { item: 'Apple', quantity: '1 medium' }],
        [{ item: 'Greek yogurt', quantity: '200g' }, { item: 'Almonds', quantity: '25g' }],
        [{ item: 'Cottage cheese', quantity: '150g' }, { item: 'Pineapple', quantity: '1 cup' }],
      ],
      'Afternoon Snack': [
        [{ item: 'Rice cakes', quantity: '3 pieces' }, { item: 'Peanut butter', quantity: '2 tbsp' }],
        [{ item: 'Trail mix', quantity: '40g' }, { item: 'Banana', quantity: '1 medium' }],
      ],
      'Pre-Workout': [
        [{ item: 'Banana', quantity: '1 medium' }, { item: 'Whey shake', quantity: '1 serving' }],
        [{ item: 'Oats', quantity: '50g' }, { item: 'Honey', quantity: '1 tbsp' }],
      ],
    },
    Vegetarian: {
      Breakfast: [
        [{ item: 'Oats', quantity: '80g' }, { item: 'Greek yogurt', quantity: '250g' }, { item: 'Berries', quantity: '1 cup' }],
        [{ item: 'Paneer toast', quantity: '2 slices' }, { item: 'Fruit', quantity: '1 serving' }],
        [{ item: 'Tofu scramble', quantity: '200g tofu' }, { item: 'Whole grain toast', quantity: '2 slices' }],
      ],
      Lunch: [
        [{ item: 'Paneer rice bowl', quantity: '1 bowl' }, { item: 'Mixed vegetables', quantity: '1 cup' }],
        [{ item: 'Lentil curry', quantity: '1.5 cups' }, { item: 'Rice', quantity: '1.5 cups' }],
        [{ item: 'Chickpea quinoa salad', quantity: '1 large bowl' }, { item: 'Olive oil', quantity: '1 tbsp' }],
      ],
      Dinner: [
        [{ item: 'Tofu stir fry', quantity: '200g tofu' }, { item: 'Rice noodles', quantity: '1.5 cups' }],
        [{ item: 'Paneer curry', quantity: '180g paneer' }, { item: 'Chapati', quantity: '3 pieces' }],
        [{ item: 'Vegetable pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }],
      ],
      Snack: [
        [{ item: 'Soy yogurt', quantity: '200g' }, { item: 'Walnuts', quantity: '25g' }],
        [{ item: 'Protein smoothie', quantity: '1 serving' }, { item: 'Banana', quantity: '1 medium' }],
      ],
      'Afternoon Snack': [
        [{ item: 'Roasted chickpeas', quantity: '50g' }, { item: 'Apple', quantity: '1 medium' }],
        [{ item: 'Peanut butter sandwich', quantity: '1 serving' }],
      ],
      'Pre-Workout': [
        [{ item: 'Banana', quantity: '1 medium' }, { item: 'Soy milk', quantity: '250ml' }],
        [{ item: 'Dates', quantity: '4 pieces' }, { item: 'Almonds', quantity: '15g' }],
      ],
    },
    Vegan: {
      Breakfast: [
        [{ item: 'Overnight oats', quantity: '80g oats' }, { item: 'Soy milk', quantity: '250ml' }, { item: 'Chia seeds', quantity: '1 tbsp' }],
        [{ item: 'Tofu scramble', quantity: '200g tofu' }, { item: 'Whole grain toast', quantity: '2 slices' }],
        [{ item: 'Smoothie bowl', quantity: '1 bowl' }, { item: 'Peanut butter', quantity: '1 tbsp' }],
      ],
      Lunch: [
        [{ item: 'Lentil rice bowl', quantity: '1 large bowl' }, { item: 'Mixed vegetables', quantity: '1 cup' }],
        [{ item: 'Chickpea curry', quantity: '1.5 cups' }, { item: 'Rice', quantity: '1.5 cups' }],
        [{ item: 'Tofu quinoa salad', quantity: '1 large bowl' }, { item: 'Avocado', quantity: '1/2 fruit' }],
      ],
      Dinner: [
        [{ item: 'Tempeh stir fry', quantity: '180g tempeh' }, { item: 'Rice noodles', quantity: '1.5 cups' }],
        [{ item: 'Bean chili', quantity: '1.5 cups' }, { item: 'Sweet potato', quantity: '250g' }],
        [{ item: 'Tofu pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }],
      ],
      Snack: [
        [{ item: 'Soy yogurt', quantity: '200g' }, { item: 'Berries', quantity: '1 cup' }],
        [{ item: 'Hummus', quantity: '4 tbsp' }, { item: 'Carrot sticks', quantity: '1 cup' }],
      ],
      'Afternoon Snack': [
        [{ item: 'Roasted chickpeas', quantity: '50g' }, { item: 'Banana', quantity: '1 medium' }],
        [{ item: 'Trail mix', quantity: '40g' }],
      ],
      'Pre-Workout': [
        [{ item: 'Banana', quantity: '1 medium' }, { item: 'Oats', quantity: '40g' }],
        [{ item: 'Dates', quantity: '4 pieces' }, { item: 'Soy milk', quantity: '250ml' }],
      ],
    },
    Pescatarian: {
      Breakfast: [
        [{ item: 'Oats', quantity: '80g' }, { item: 'Greek yogurt', quantity: '200g' }, { item: 'Berries', quantity: '1 cup' }],
        [{ item: 'Egg omelette', quantity: '3 eggs' }, { item: 'Whole grain toast', quantity: '2 slices' }],
      ],
      Lunch: [
        [{ item: 'Salmon rice bowl', quantity: '1 large bowl' }, { item: 'Veggies', quantity: '1 cup' }],
        [{ item: 'Tuna wrap', quantity: '1 large wrap' }, { item: 'Salad greens', quantity: '2 cups' }],
      ],
      Dinner: [
        [{ item: 'Grilled fish', quantity: '180g' }, { item: 'Potatoes', quantity: '250g' }, { item: 'Green beans', quantity: '1 cup' }],
        [{ item: 'Shrimp pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }],
      ],
      Snack: [
        [{ item: 'Protein shake', quantity: '1 serving' }, { item: 'Apple', quantity: '1 medium' }],
        [{ item: 'Greek yogurt', quantity: '200g' }, { item: 'Walnuts', quantity: '20g' }],
      ],
      'Afternoon Snack': [
        [{ item: 'Rice cakes', quantity: '3 pieces' }, { item: 'Cottage cheese', quantity: '150g' }],
      ],
      'Pre-Workout': [
        [{ item: 'Banana', quantity: '1 medium' }, { item: 'Whey shake', quantity: '1 serving' }],
      ],
    },
    'No Red Meat': {
      Breakfast: [
        [{ item: 'Oats', quantity: '80g' }, { item: 'Eggs', quantity: '3 large' }, { item: 'Berries', quantity: '1 cup' }],
        [{ item: 'Greek yogurt', quantity: '250g' }, { item: 'Granola', quantity: '40g' }],
      ],
      Lunch: [
        [{ item: 'Chicken rice bowl', quantity: '1 large bowl' }, { item: 'Vegetables', quantity: '1 cup' }],
        [{ item: 'Turkey sandwich', quantity: '1 large sandwich' }, { item: 'Fruit', quantity: '1 serving' }],
      ],
      Dinner: [
        [{ item: 'Salmon', quantity: '180g' }, { item: 'Sweet potato', quantity: '250g' }, { item: 'Broccoli', quantity: '1 cup' }],
        [{ item: 'Chicken pasta', quantity: '2 cups' }, { item: 'Salad', quantity: '1 bowl' }],
      ],
      Snack: [
        [{ item: 'Protein shake', quantity: '1 serving' }, { item: 'Banana', quantity: '1 medium' }],
        [{ item: 'Cottage cheese', quantity: '150g' }, { item: 'Almonds', quantity: '20g' }],
      ],
      'Afternoon Snack': [
        [{ item: 'Rice cakes', quantity: '3 pieces' }, { item: 'Peanut butter', quantity: '2 tbsp' }],
      ],
      'Pre-Workout': [
        [{ item: 'Banana', quantity: '1 medium' }, { item: 'Whey shake', quantity: '1 serving' }],
      ],
    },
  };

  const dietBank = banks[dietType] || banks['No Restrictions'];
  const options = dietBank[slot] || dietBank.Breakfast;
  const seedOffset = Math.abs(
    [...slot].reduce((total, char) => total + char.charCodeAt(0), 0) + dayIndex + seed
  );
  const selected = options[seedOffset % options.length] || options[0] || [];

  return selected.map((item) => ({
    item: item.item,
    quantity: item.quantity,
  }));
}

function buildMealPlan(questionnaire: any, level: string, goal: string, seed: number) {
  const weightKg = Number(questionnaire.weight) || 70;
  const mealsPerDay = Math.max(2, Number(questionnaire.mealsPerDay) || 4);
  const dietType = getDietType(questionnaire);
  const calories = getDailyCalories(questionnaire, goal);
  const macros = getMacroTargets(goal, weightKg, calories);
  const mealSlots = getMealSlotNames(mealsPerDay);
  const macroWeights = getMealMacroWeights(mealsPerDay);
  const hydrationGuidance = hasDigestiveIssue(questionnaire)
    ? 'Sip fluids throughout the day and avoid very large meals close to training if reflux is a concern.'
    : 'Aim for steady hydration across the day and increase intake around training sessions.';

  const mealCalories = mealSlots.map((_, mealIndex) => {
    if (mealIndex === mealSlots.length - 1) {
      return 0;
    }

    const weight = macroWeights[mealIndex] || 1 / mealSlots.length;
    return Math.max(150, Math.round(calories * weight));
  });

  const allocatedCalories = mealCalories.reduce((total, value) => total + value, 0);
  mealCalories[mealSlots.length - 1] = Math.max(150, calories - allocatedCalories);

  const mealProteinTargets = mealSlots.map((_, mealIndex) => {
    if (mealIndex === mealSlots.length - 1) {
      return 0;
    }

    const weight = macroWeights[mealIndex] || 1 / mealSlots.length;
    return Math.max(10, Math.round(macros.protein * weight));
  });

  const mealFatTargets = mealSlots.map((_, mealIndex) => {
    if (mealIndex === mealSlots.length - 1) {
      return 0;
    }

    const weight = macroWeights[mealIndex] || 1 / mealSlots.length;
    return Math.max(5, Math.round(macros.fats * weight));
  });

  const allocatedProtein = mealProteinTargets.reduce((total, value) => total + value, 0);
  const allocatedFat = mealFatTargets.reduce((total, value) => total + value, 0);
  mealProteinTargets[mealSlots.length - 1] = Math.max(10, macros.protein - allocatedProtein);
  mealFatTargets[mealSlots.length - 1] = Math.max(5, macros.fats - allocatedFat);

  const carbsForMeals = Math.max(0, macros.carbs);
  const mealCarbTargets = mealSlots.map((_, mealIndex) => {
    if (mealIndex === mealSlots.length - 1) {
      return 0;
    }

    const weight = macroWeights[mealIndex] || 1 / mealSlots.length;
    return Math.max(15, Math.round(carbsForMeals * weight));
  });

  const allocatedCarbs = mealCarbTargets.reduce((total, value) => total + value, 0);
  mealCarbTargets[mealSlots.length - 1] = Math.max(15, carbsForMeals - allocatedCarbs);

  const weeklyPlan = Array.from({ length: 7 }, (_, dayIndex) => {
    const meals = mealSlots.map((slot, mealIndex) => {
      const mealCaloriesForSlot = mealCalories[mealIndex];
      const mealProtein = mealProteinTargets[mealIndex];
      const mealCarbs = mealCarbTargets[mealIndex];
      const mealFat = mealFatTargets[mealIndex];

      return {
        mealType: slot,
        calories: mealCaloriesForSlot,
        protein: mealProtein,
        carbs: mealCarbs,
        fats: mealFat,
        items: buildMealItems(dietType, slot, dayIndex, goal, seed),
      };
    });

    return {
      day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex],
      meals,
      dayTotal: {
        calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
      },
    };
  });

  const allowedProteins =
    dietType === 'Vegan'
      ? ['tofu', 'tempeh', 'lentils', 'chickpeas', 'soy protein']
      : dietType === 'Vegetarian'
        ? ['eggs', 'Greek yogurt', 'paneer', 'tofu', 'lentils']
        : dietType === 'Pescatarian'
          ? ['fish', 'salmon', 'tuna', 'eggs', 'Greek yogurt']
          : dietType === 'No Red Meat'
            ? ['chicken', 'turkey', 'fish', 'eggs', 'Greek yogurt']
            : ['chicken', 'eggs', 'fish', 'Greek yogurt', 'lean beef'];

  const shoppingList = [
    { category: 'Protein', items: allowedProteins },
    { category: 'Carbs', items: ['oats', 'rice', 'potatoes', 'whole grain bread', 'fruit'] },
    { category: 'Vegetables', items: ['spinach', 'broccoli', 'mixed vegetables', 'greens', 'tomatoes'] },
    { category: 'Fats', items: ['olive oil', 'avocado', 'nuts', 'seeds', 'peanut butter'] },
  ];

  const supplements = normalizeText(questionnaire.openToSupplements).includes('yes')
    ? dietType === 'Vegan'
      ? ['Plant protein powder', 'Creatine monohydrate', 'Vitamin B12']
      : ['Whey protein', 'Creatine monohydrate', 'Omega-3']
    : [];

  const nutritionTips =
    goal === 'Weight Loss'
      ? 'Prioritize lean protein, high-fiber vegetables, and consistent meal timing to support satiety.'
      : goal === 'Bulking'
        ? 'Use calorie-dense but nutritious meals and keep protein spread evenly through the day.'
        : goal === 'Lean Physique'
          ? 'Keep protein high, carbs around training, and meals mostly whole-food based.'
          : 'Build each meal around protein, colorful produce, and quality carbs for steady energy.';

  return {
    title: `${goal} - Meal Plan`,
    goal,
    dietType,
    duration: questionnaire.commitmentPeriod || '3-months',
    dailyCalories: calories,
    dailyProtein: macros.protein,
    dailyCarbs: macros.carbs,
    dailyFat: macros.fats,
    protein: macros.protein,
    carbs: macros.carbs,
    fats: macros.fats,
    mealsPerDay,
    nutritionTips,
    shoppingList,
    notes:
      isYesLike(questionnaire.medicalConditions) || hasDigestiveIssue(questionnaire)
        ? 'Keep meals simple, track digestion, and adjust portion size if any food causes discomfort.'
        : 'Adjust portions based on progress, recovery, and energy levels.',
    guidelines: [
      `Follow ${mealsPerDay} meals per day with consistent protein distribution.`,
      dietType === 'Vegan' || dietType === 'Vegetarian' ? 'Use plant protein combinations to hit daily protein targets.' : 'Include a protein source at every meal.',
      'Keep most meals minimally processed and centered on whole foods.',
    ],
    hydrationGuidance,
    supplements,
    weeklyPlan,
    weeks: [
      {
        week: 'Week 1',
        days: weeklyPlan,
      },
    ],
  };
}

function buildWorkoutPlan(questionnaire: any, level: string, goal: string, seed: number) {
  const environment = determineWorkoutEnvironment(questionnaire);
  const daysPerWeek = getTrainingDays(questionnaire);
  const split = getWorkoutSplit(level, daysPerWeek);

  const workoutDays = split.map((dayConfig, dayIndex) => buildWorkoutDay(dayConfig.type, environment, level, dayIndex, seed));
  const warmup = level === 'Beginner' ? '5-10 minutes of light cardio, joint circles, and movement prep.' : '5-10 minutes of cardio, mobility work, and ramp-up sets before working weight.';
  const cooldown = 'Finish with light stretching and relaxed breathing for 5 minutes.';

  return {
    title: `${goal} - ${level} Plan`,
    goal,
    level,
    duration: questionnaire.commitmentPeriod || '3-months',
    frequency: `${daysPerWeek} days/week`,
    focus: level === 'Beginner' ? 'Full Body' : daysPerWeek >= 6 ? 'Push / Pull / Legs' : daysPerWeek === 4 ? 'Upper / Lower' : daysPerWeek === 5 && level === 'Advanced' ? 'Bro Split' : 'Structured Split',
    notes:
      level === 'Beginner'
        ? 'Keep the plan simple, focus on movement quality, and progress gradually each week.'
        : level === 'Intermediate'
          ? 'Progress loads steadily while keeping good form and balanced weekly volume.'
          : 'Use a structured overload strategy and manage fatigue with recovery-focused programming.',
    warmup,
    cooldown,
    progressionStrategy:
      level === 'Beginner'
        ? 'Add repetitions first, then small load increases once all sets feel controlled.'
        : level === 'Intermediate'
          ? 'Increase load or reps when all working sets are completed at the top of the target range.'
          : 'Use top sets, back-off sets, and planned load increases across mesocycles.',
    weeks: [
      {
        weekNumber: 1,
        days: workoutDays,
        focusAreas: split.map((day) => day.title),
      },
    ],
  };
}

function buildDeterministicPlans(questionnaire: any): GeneratedPlans {
  const goal = determineFitnessGoal(questionnaire);
  const fitnessLevel = determineFitnessLevel(questionnaire);
  const seed = getPlanSeed(questionnaire);
  const workoutPlan = buildWorkoutPlan(questionnaire, fitnessLevel, goal, seed);
  const mealPlan = buildMealPlan(questionnaire, fitnessLevel, goal, seed);

  return { workoutPlan, mealPlan };
}

function normalizePlans(raw: any): GeneratedPlans | null {
  if (!raw?.workoutPlan || !raw?.mealPlan) {
    return null;
  }

  const workoutPlan = raw.workoutPlan;
  const mealPlan = raw.mealPlan;
  const mealWeekSource = mealPlan.weeks || (mealPlan.weeklyPlan ? [{ week: 'Week 1', days: mealPlan.weeklyPlan }] : []);

  const normalizedWorkoutWeeks = (workoutPlan.weeks || []).map((week: any) => ({
    ...week,
    days: (week.days || []).map((day: any) => ({
      ...day,
      exercises: (day.exercises || []).map((exercise: any) => ({
        ...exercise,
        name: exercise.name || exercise.exercise || 'Exercise',
        exercise: exercise.exercise || exercise.name || 'Exercise',
      })),
    })),
  }));

  const normalizedMealWeeks = mealWeekSource.map((week: any) => ({
    ...week,
    days: (week.days || []).map((day: any) => ({
      ...day,
      totalCalories: day.totalCalories ?? day.calories ?? day.dayTotal?.calories ?? 0,
      protein: day.protein ?? day.dayTotal?.protein ?? 0,
      carbs: day.carbs ?? day.dayTotal?.carbs ?? 0,
      fat: day.fat ?? day.dayTotal?.fats ?? day.dayTotal?.fat ?? 0,
      meals: (day.meals || []).map((meal: any) => ({
        ...meal,
        type: meal.type || meal.mealType || 'Meal',
        mealType: meal.mealType || meal.type || 'Meal',
        calories: meal.calories ?? 0,
        protein: meal.protein ?? 0,
        carbs: meal.carbs ?? 0,
        fat: meal.fat ?? 0,
        fats: meal.fats ?? meal.fat ?? 0,
        items: (meal.items || []).map((item: any) => {
          if (typeof item === 'string') {
            return { item, name: item };
          }
          return {
            ...item,
            item: item.item || item.name,
            name: item.name || item.item,
          };
        }),
      })),
    })),
  }));

  const weeklyPlan = normalizedMealWeeks[0]?.days?.map((day: any) => ({
    day: day.day,
    meals: day.meals,
    dayTotal: {
      calories: day.totalCalories,
      protein: day.protein,
      carbs: day.carbs,
      fats: day.fat,
    },
  })) || [];

  const rawShoppingList = mealPlan.shoppingList;
  const shoppingList = Array.isArray(rawShoppingList)
    ? rawShoppingList
    : typeof rawShoppingList === 'string'
    ? [{ category: 'General', items: rawShoppingList.split(',').map((item: string) => item.trim()).filter(Boolean) }]
    : [];

  return {
    workoutPlan: {
      ...workoutPlan,
      weeks: normalizedWorkoutWeeks,
    },
    mealPlan: {
      ...mealPlan,
      dailyCalories: mealPlan.dailyCalories ?? mealPlan.calories ?? 0,
      dailyProtein: mealPlan.dailyProtein ?? mealPlan.protein ?? 0,
      dailyCarbs: mealPlan.dailyCarbs ?? mealPlan.carbs ?? 0,
      dailyFat: mealPlan.dailyFat ?? mealPlan.fats ?? 0,
      protein: mealPlan.protein ?? mealPlan.dailyProtein ?? 0,
      carbs: mealPlan.carbs ?? mealPlan.dailyCarbs ?? 0,
      fats: mealPlan.fats ?? mealPlan.dailyFat ?? 0,
      weeks: normalizedMealWeeks,
      weeklyPlan,
      shoppingList,
    },
  };
}

async function createPlanVersion(userId: string, questionnaireId: string | null, workoutPlan: any, mealPlan: any) {
  const workoutPlanData = {
    userId,
    questionnaireId: questionnaireId || undefined,
    ...workoutPlan,
  };

  const mealPlanData = {
    userId,
    questionnaireId: questionnaireId || undefined,
    ...mealPlan,
  };

  const [savedWorkoutPlan, savedMealPlan] = await Promise.all([
    WorkoutPlan.create(workoutPlanData),
    MealPlan.create(mealPlanData),
  ]);

  return { savedWorkoutPlan, savedMealPlan };
}

async function generatePlansWithGroq(questionnaire: any, requestId: string): Promise<GeneratedPlans | null> {
  if (!GROQ_API_KEY) {
    logAiEvent('GROQ_API_KEY missing - fallback engaged', { requestId });
    return null;
  }

  const prompt = `You are a professional fitness and nutrition coach.
Generate a personalized workout plan and meal plan in strict JSON format ONLY.
Do not include any extra text before or after the JSON.

Use this exact schema:
{
  "workoutPlan": {
    "title": string,
    "goal": string,
    "level": string,
    "duration": string,
    "frequency": string,
    "focus": string,
    "notes": string,
    "weeks": [
      {
        "week": string,
        "days": [
          {
            "day": string,
            "title": string,
            "duration": string,
            "focus": [string],
            "exercises": [
              {
                "name": string,
                "sets": number,
                "reps": string,
                "rest": string,
                "target": string,
                "notes": string
              }
            ]
          }
        ]
      }
    ]
  },
  "mealPlan": {
    "title": string,
    "goal": string,
    "dailyCalories": number,
    "dailyProtein": number,
    "dailyCarbs": number,
    "dailyFat": number,
    "nutritionTips": string,
    "shoppingList": string,
    "notes": string,
    "weeks": [
      {
        "week": string,
        "days": [
          {
            "day": string,
            "totalCalories": number,
            "protein": number,
            "carbs": number,
            "fat": number,
            "meals": [
              {
                "type": string,
                "time": string,
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "items": [{"item": string, "quantity": string}]
              }
            ]
          }
        ]
      }
    ]
  }
}

Client questionnaire:
${JSON.stringify(questionnaire, null, 2)}
`;

  let response: any;

  try {
    response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 4000,
    });
  } catch (error: any) {
    logAiEvent('Groq API request failed', {
      requestId,
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });
    return null;
  }

  const text = response?.choices?.[0]?.message?.content || '';
  logAiEvent('Groq response received', {
    requestId,
    outputLength: text.length,
    hasChoices: Array.isArray(response?.choices),
  });

  if (!text.trim()) {
    logAiEvent('Groq response empty - fallback engaged', { requestId });
    return null;
  }

  const jsonBlock = extractJsonBlock(text) || text;

  try {
    const parsed = JSON.parse(jsonBlock);
    const normalized = normalizePlans(parsed);
    if (!normalized) {
      logAiEvent('Groq response missing required keys', { requestId });
      return null;
    }

    const issues = validatePlansShape(normalized);
    if (issues.length > 0) {
      logAiEvent('Groq response failed validation', { requestId, issues });
      return null;
    }

    return normalized;
  } catch (error: any) {
    logAiEvent('Groq response parse failed', {
      requestId,
      message: error?.message,
      sample: jsonBlock.slice(0, 200),
    });
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID();
    console.log('🤖 [PLAN GENERATION] Starting plan generation...', { requestId });

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

    const deterministicPlans = buildDeterministicPlans(questionnaire);
    const aiPlans = process.env.ENABLE_AI_PLAN_GENERATION === 'true'
      ? await generatePlansWithGroq(questionnaire, requestId)
      : null;

    const plans = aiPlans || deterministicPlans;
    const normalizedPlans = normalizePlans(plans) || normalizePlans(deterministicPlans) || deterministicPlans;

    const savedQuestionnaire = await Questionnaire.findOne({ userId: decoded.id }).sort({ updatedAt: -1, createdAt: -1 });
    const questionnaireId = savedQuestionnaire?._id ? String(savedQuestionnaire._id) : null;

    console.log('✅ [PLAN GENERATION] Plans generated successfully');
    console.log(`   - Fitness Level: ${fitnessLevel}`);
    console.log(`   - Workout days: ${normalizedPlans.workoutPlan.weeks?.[0]?.days?.length || 0}`);
    console.log(`   - Meals per day: ${mealsPerDay}`);

    const { savedWorkoutPlan, savedMealPlan } = await createPlanVersion(
      decoded.id,
      questionnaireId,
      normalizedPlans.workoutPlan,
      normalizedPlans.mealPlan
    );

    console.log('✅ [PLAN GENERATION] Workout and meal plan versions saved');
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
    const workoutHistory = await WorkoutPlan.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(12);
    const mealHistory = await MealPlan.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(12);

    console.log('✅ [PLAN GENERATION] Plans retrieved');

    return NextResponse.json(
      {
        message: 'Plans retrieved successfully',
        data: {
          workoutPlan,
          mealPlan,
          workoutHistory,
          mealHistory,
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
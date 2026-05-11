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

type GeneratedPlans = { workoutPlan: any; mealPlan: any };

function logAiEvent(event: string, payload: Record<string, unknown>) {
  console.log(`🤖 [PLAN GENERATION] ${event}`, payload);
}

function extractJsonBlock(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function normalizeText(value: any) {
  return String(value ?? '').toLowerCase().replace(/[\s\u00A0]+/g, ' ').trim();
}

function isYesLike(value: any) {
  if (value === true) return true;
  const n = normalizeText(value);
  return n === 'yes' || n === 'true' || n.includes('yes');
}

function hasDigestiveIssue(q: any) {
  const gerdText = Array.isArray(q.gerd) ? q.gerd.map(normalizeText).join(' ') : '';
  const gastroText = normalizeText(q.gastroproblem);
  return gerdText.includes('acid') || gerdText.includes('bloating') || gastroText.includes('acid') || gastroText.includes('bloating');
}

// ─── STEP 1: STRICT USER CLASSIFICATION ───────────────────────────────────────
function determineFitnessLevel(q: any): 'Beginner' | 'Intermediate' | 'Advanced' {
  const background: string[] = Array.isArray(q.exerciseBackground)
    ? q.exerciseBackground.map(normalizeText)
    : [normalizeText(q.exerciseBackground)];

  const hasGymResistance = background.some(b =>
    b.includes('gym') || b.includes('resistance') || b.includes('weight') || b.includes('strength')
  );
  const hasOnlyCardioYoga = background.every(b =>
    !b || b.includes('walk') || b.includes('yoga') || b.includes('pilates') ||
    b.includes('cardio') || b.includes('none') || b.includes('no experience')
  );
  const activityLevel = normalizeText(q.physicalActivityLevel);
  const hasSignificantActivity = activityLevel.includes('significant') || activityLevel.includes('intense');
  const daysPerWeek = getTrainingDays(q);

  if (!hasGymResistance || hasOnlyCardioYoga) return 'Beginner';
  if (hasGymResistance && hasSignificantActivity && daysPerWeek >= 5) return 'Advanced';
  return 'Intermediate';
}

function getTrainingDays(q: any): number {
  const raw = q.daysPerWeek ?? q.exerciseDaysPerWeek;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(1, Math.min(7, Math.round(raw)));
  const n = normalizeText(raw);
  if (!n) return 3;
  const parsed = parseInt(n, 10);
  if (Number.isFinite(parsed)) return Math.max(1, Math.min(7, parsed));
  if (n.includes('6')) return 6;
  if (n.includes('5')) return 5;
  if (n.includes('4')) return 4;
  if (n.includes('3')) return 3;
  if (n.includes('1-2') || n.includes('1 to 2')) return 2;
  return 3;
}

function determineFitnessGoal(q: any): 'Weight Loss' | 'Maintenance' | 'Bulking' | 'Lean Physique' {
  const g = normalizeText(q.goal || q.fitnessGoals?.[0]);
  if (g.includes('weight loss') || g.includes('lose')) return 'Weight Loss';
  if (g.includes('bulking') || g.includes('gain muscle') || g.includes('muscle gain')) return 'Bulking';
  if (g.includes('lean') || g.includes('physique') || g.includes('aesthetic')) return 'Lean Physique';
  return 'Maintenance';
}

function determineWorkoutEnvironment(q: any): 'home' | 'gym' | 'mixed' {
  const raw = normalizeText(q.exerciseCapability || q.exerciseLocation);
  if (raw.includes('gym') && raw.includes('home')) return 'mixed';
  if (raw.includes('gym')) return 'gym';
  if (raw.includes('mixed') || raw.includes('both') || raw.includes('outdoor')) return 'mixed';
  if (raw.includes('home')) return 'home';
  return 'gym';
}

// ─── STEP 2: WORKOUT SPLIT ─────────────────────────────────────────────────────
function getWorkoutSplit(level: string, days: number) {
  if (level === 'Beginner') {
    return Array.from({ length: days }, (_, i) => ({
      type: 'full-body',
      title: `Full Body ${String.fromCharCode(65 + i)}`,
      focus: ['Legs', 'Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'],
    }));
  }
  if (days >= 6) return [
    { type: 'push', title: 'Push Day', focus: ['Chest', 'Shoulders', 'Triceps'] },
    { type: 'pull', title: 'Pull Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
    { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
    { type: 'push', title: 'Push Day 2', focus: ['Chest', 'Shoulders', 'Triceps'] },
    { type: 'pull', title: 'Pull Day 2', focus: ['Back', 'Rear Delts', 'Biceps'] },
    { type: 'legs', title: 'Leg Day 2', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
  ];
  if (days === 5) return level === 'Advanced'
    ? [
      { type: 'chest', title: 'Chest Day', focus: ['Chest', 'Upper Chest', 'Triceps'] },
      { type: 'back', title: 'Back Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
      { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
      { type: 'shoulders', title: 'Shoulders Day', focus: ['Shoulders', 'Rear Delts', 'Traps'] },
      { type: 'arms', title: 'Arms Day', focus: ['Biceps', 'Triceps', 'Forearms'] },
    ]
    : [
      { type: 'push', title: 'Push Day', focus: ['Chest', 'Shoulders', 'Triceps'] },
      { type: 'pull', title: 'Pull Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
      { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
      { type: 'upper', title: 'Upper Body Day', focus: ['Chest', 'Back', 'Shoulders', 'Arms'] },
      { type: 'lower', title: 'Lower Body Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
    ];
  if (days === 4) return [
    { type: 'upper', title: 'Upper Workout', focus: ['Chest', 'Back', 'Shoulders', 'Arms'] },
    { type: 'lower', title: 'Lower Workout', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
    { type: 'upper', title: 'Upper Workout', focus: ['Chest', 'Back', 'Shoulders', 'Arms'] },
    { type: 'lower', title: 'Lower Workout', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
  ];
  return [
    { type: 'push', title: 'Push Day', focus: ['Chest', 'Shoulders', 'Triceps'] },
    { type: 'pull', title: 'Pull Day', focus: ['Back', 'Rear Delts', 'Biceps'] },
    { type: 'legs', title: 'Leg Day', focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
  ].slice(0, days);
}

// ─── STEP 3: EXERCISE LIBRARY ──────────────────────────────────────────────────
const EXERCISE_LIBRARY: Record<string, Record<string, string[]>> = {
  home: {
    Legs: ['Goblet Squat', 'Bulgarian Split Squat', 'Reverse Lunge', 'Step-Up', 'Wall Sit', 'Jump Squat'],
    Chest: ['Push-Up', 'Incline Push-Up', 'Dumbbell Floor Press', 'Diamond Push-Up', 'Wide Push-Up', 'Decline Push-Up'],
    Back: ['One-Arm Dumbbell Row', 'Band Row', 'Chest-Supported Row', 'Superman Row', 'Renegade Row', 'Inverted Row'],
    Shoulders: ['Dumbbell Overhead Press', 'Pike Push-Up', 'Lateral Raise', 'Arnold Press', 'Front Raise', 'Rear Delt Fly'],
    Triceps: ['Bench Dip', 'Overhead Dumbbell Extension', 'Diamond Push-Up', 'Close-Grip Push-Up', 'Tricep Kickback', 'Skull Crusher'],
    Biceps: ['Dumbbell Curl', 'Hammer Curl', 'Band Curl', 'Zottman Curl', 'Concentration Curl', 'Incline Curl'],
    Quads: ['Goblet Squat', 'Split Squat', 'Step-Up', 'Wall Sit', 'Lunge', 'Jump Squat'],
    Hamstrings: ['Romanian Deadlift', 'Single-Leg RDL', 'Glute Bridge Walkout', 'Nordic Curl', 'Hip Hinge', 'Good Morning'],
    Glutes: ['Hip Thrust', 'Glute Bridge', 'Single-Leg Glute Bridge', 'Donkey Kick', 'Clamshell', 'Fire Hydrant'],
    Calves: ['Standing Calf Raise', 'Single-Leg Calf Raise', 'Tempo Calf Raise', 'Bent-Knee Calf Raise', 'Jump Rope', 'Seated Calf Raise'],
    Core: ['Plank', 'Dead Bug', 'Hollow Hold', 'Bird Dog', 'Mountain Climber', 'Ab Wheel Rollout'],
    'Rear Delts': ['Band Face Pull', 'Reverse Fly', 'Prone Y Raise', 'Band Pull-Apart', 'Rear Delt Raise', 'Face Pull'],
    'Upper Chest': ['Incline Push-Up', 'Feet-Elevated Push-Up', 'Low-Incline Dumbbell Press', 'Band Incline Press', 'Incline Fly', 'Pike Press'],
    Arms: ['Close-Grip Push-Up', 'Dumbbell Curl', 'Bench Dip', 'Hammer Curl', 'Overhead Extension', 'Tricep Kickback'],
    Forearms: ['Towel Hold', 'Farmer Carry', 'Wrist Curl', 'Reverse Curl', 'Pinch Grip', 'Band Wrist Extension'],
  },
  gym: {
    Legs: ['Barbell Back Squat', 'Front Squat', 'Leg Press', 'Hack Squat', 'Walking Lunge', 'Bulgarian Split Squat'],
    Chest: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Bench Press', 'Machine Chest Press', 'Cable Fly', 'Pec Deck'],
    Back: ['Barbell Row', 'Lat Pulldown', 'Chest-Supported Row', 'Seated Cable Row', 'T-Bar Row', 'Single-Arm Cable Row'],
    Shoulders: ['Barbell Overhead Press', 'Seated Dumbbell Press', 'Machine Shoulder Press', 'Lateral Raise', 'Arnold Press', 'Cable Lateral Raise'],
    Triceps: ['Cable Pushdown', 'Skull Crusher', 'Overhead Rope Extension', 'Weighted Dip', 'Close-Grip Bench Press', 'Tricep Machine'],
    Biceps: ['EZ-Bar Curl', 'Incline Dumbbell Curl', 'Cable Curl', 'Preacher Curl', 'Barbell Curl', 'Hammer Curl'],
    Quads: ['Back Squat', 'Leg Press', 'Hack Squat', 'Leg Extension', 'Front Squat', 'Walking Lunge'],
    Hamstrings: ['Romanian Deadlift', 'Seated Leg Curl', 'Lying Leg Curl', 'Good Morning', 'Stiff-Leg Deadlift', 'Nordic Curl'],
    Glutes: ['Hip Thrust', 'Cable Pull-Through', 'Bulgarian Split Squat', 'Smith Machine Glute Bridge', 'Glute Kickback Machine', 'Cable Hip Extension'],
    Calves: ['Standing Calf Raise', 'Seated Calf Raise', 'Leg Press Calf Raise', 'Donkey Calf Raise', 'Single-Leg Calf Raise', 'Smith Machine Calf Raise'],
    Core: ['Cable Crunch', 'Hanging Leg Raise', 'Ab Wheel Rollout', 'Pallof Press', 'Decline Crunch', 'Dragon Flag'],
    'Rear Delts': ['Face Pull', 'Reverse Pec Deck', 'Rear Delt Cable Fly', 'Bent-Over Reverse Fly', 'Cable Rear Delt Row', 'Seated Rear Delt Fly'],
    'Upper Chest': ['Incline Bench Press', 'Incline Dumbbell Press', 'Low-Incline Smith Press', 'Incline Cable Fly', 'Landmine Press', 'High-to-Low Cable Fly'],
    Arms: ['EZ-Bar Curl', 'Cable Pushdown', 'Preacher Curl', 'Overhead Rope Extension', 'Hammer Curl', 'Tricep Dip'],
    Forearms: ['Farmer Carry', 'Reverse Curl', 'Wrist Curl', 'Plate Pinch Hold', 'Cable Wrist Extension', 'Barbell Wrist Roller'],
  },
  mixed: {
    Legs: ['Goblet Squat', 'Leg Press', 'Bulgarian Split Squat', 'Walking Lunge', 'Romanian Deadlift', 'Step-Up'],
    Chest: ['Dumbbell Bench Press', 'Incline Dumbbell Press', 'Machine Chest Press', 'Push-Up', 'Cable Fly', 'Incline Push-Up'],
    Back: ['Lat Pulldown', 'Seated Cable Row', 'Chest-Supported Row', 'Single-Arm Dumbbell Row', 'Band Row', 'T-Bar Row'],
    Shoulders: ['Seated Dumbbell Press', 'Machine Shoulder Press', 'Lateral Raise', 'Face Pull', 'Arnold Press', 'Cable Lateral Raise'],
    Triceps: ['Cable Pushdown', 'Overhead Rope Extension', 'Assisted Dip', 'Skull Crusher', 'Diamond Push-Up', 'Tricep Kickback'],
    Biceps: ['EZ-Bar Curl', 'Incline Dumbbell Curl', 'Hammer Curl', 'Cable Curl', 'Dumbbell Curl', 'Concentration Curl'],
    Quads: ['Leg Press', 'Front Squat', 'Walking Lunge', 'Leg Extension', 'Goblet Squat', 'Split Squat'],
    Hamstrings: ['Romanian Deadlift', 'Seated Leg Curl', 'Lying Leg Curl', 'Dumbbell RDL', 'Single-Leg RDL', 'Nordic Curl'],
    Glutes: ['Hip Thrust', 'Cable Pull-Through', 'Glute Bridge', 'Bulgarian Split Squat', 'Donkey Kick', 'Cable Hip Extension'],
    Calves: ['Standing Calf Raise', 'Seated Calf Raise', 'Single-Leg Calf Raise', 'Press Calf Raise', 'Tempo Calf Raise', 'Machine Calf Raise'],
    Core: ['Cable Crunch', 'Pallof Press', 'Hanging Knee Raise', 'Ab Wheel Rollout', 'Plank', 'Dead Bug'],
    'Rear Delts': ['Face Pull', 'Reverse Pec Deck', 'Rear Delt Fly', 'Cable Rear Delt Row', 'Band Face Pull', 'Reverse Fly'],
    'Upper Chest': ['Incline Dumbbell Press', 'Incline Machine Press', 'Low-Incline Barbell Press', 'Incline Cable Fly', 'Incline Push-Up', 'Low-Incline Fly'],
    Arms: ['Cable Curl', 'Rope Pushdown', 'EZ-Bar Curl', 'Overhead Rope Extension', 'Hammer Curl', 'Dumbbell Curl'],
    Forearms: ['Farmer Carry', 'Reverse Curl', 'Wrist Curl', 'Cable Wrist Extension', 'Pinch Grip', 'Band Wrist Extension'],
  },
};

function getExerciseName(env: 'home' | 'gym' | 'mixed', target: string, dayIndex: number, exerciseIndex: number, seed: number): string {
  const options = EXERCISE_LIBRARY[env]?.[target] || EXERCISE_LIBRARY.mixed?.[target] || EXERCISE_LIBRARY.gym?.[target] || [target];
  // Use a varied rotation: mix seed + dayIndex with a prime offset so Day 1 ≠ Day 2 for same muscle
  const rotation = (seed + dayIndex * 7 + exerciseIndex * 3) % options.length;
  return options[rotation];
}

type ExerciseCategory = 'compound' | 'accessory';

function buildExercise({
  environment, target, category, level, dayIndex, exerciseIndex, seed,
}: {
  environment: 'home' | 'gym' | 'mixed';
  target: string; category: ExerciseCategory; level: string;
  dayIndex: number; exerciseIndex: number; seed: number;
}) {
  // STEP 3 RULE: Beginner sets 2-4, Intermediate 3-4, Advanced 4-5
  const progressive = {
    Beginner: { compound: { sets: 3, reps: '10-12', rest: '60-90s' }, accessory: { sets: 3, reps: '12-15', rest: '60s' } },
    Intermediate: { compound: { sets: 4, reps: '8-10', rest: '90-120s' }, accessory: { sets: 3, reps: '10-12', rest: '60-90s' } },
    Advanced: { compound: { sets: 4, reps: '6-8', rest: '120-180s' }, accessory: { sets: 4, reps: '8-12', rest: '60-90s' } },
  } as const;
  const prog = progressive[level as keyof typeof progressive] || progressive.Intermediate;
  const exerciseName = getExerciseName(environment, target, dayIndex, exerciseIndex, seed);
  return {
    id: crypto.randomUUID(),
    name: exerciseName,
    exercise: exerciseName,
    sets: prog[category].sets,
    reps: prog[category].reps,
    rest: prog[category].rest,
    target,
    notes: level === 'Beginner'
      ? 'Focus on form. Stop 2-3 reps before failure.'
      : level === 'Intermediate'
        ? 'Add load when top of rep range feels easy.'
        : 'Use progressive overload; keep 1-2 reps in reserve.',
  };
}

// ─── BUILD WORKOUT DAY ─────────────────────────────────────────────────────────
function buildWorkoutDay(
  dayType: string, environment: 'home' | 'gym' | 'mixed',
  level: string, dayIndex: number, seed: number
) {
  type BlueprintItem = { target: string; category: ExerciseCategory };

  const dayBlueprints: Record<string, BlueprintItem[]> = {
    // BEGINNER RULE: EXACTLY 1 exercise per muscle group (6 total)
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
      { target: 'Core', category: 'accessory' },
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
      { target: 'Upper Chest', category: 'compound' },
      { target: 'Chest', category: 'accessory' },
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
      { target: 'Rear Delts', category: 'accessory' },
      { target: 'Upper Chest', category: 'compound' },
      { target: 'Triceps', category: 'compound' },
      { target: 'Core', category: 'accessory' },
    ],
    arms: [
      { target: 'Biceps', category: 'compound' },
      { target: 'Triceps', category: 'compound' },
      { target: 'Biceps', category: 'accessory' },
      { target: 'Triceps', category: 'accessory' },
      { target: 'Forearms', category: 'accessory' },
      { target: 'Core', category: 'accessory' },
    ],
  };

  const blueprint = dayBlueprints[dayType] || dayBlueprints['full-body'];
  const exercises = blueprint.map((item, exIdx) =>
    buildExercise({ environment, target: item.target, category: item.category, level, dayIndex, exerciseIndex: exIdx, seed })
  );
  const durationMap: Record<string, string> = { Beginner: '45-60 min', Intermediate: '60-75 min', Advanced: '75-90 min' };
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const titleMap: Record<string, string> = {
    'full-body': 'Full Body Workout', push: 'Push Workout', pull: 'Pull Workout', legs: 'Leg Workout',
    upper: 'Upper Workout', lower: 'Lower Workout', chest: 'Chest Day', back: 'Back Day',
    shoulders: 'Shoulders Day', arms: 'Arms Day',
  };
  return {
    day: dayNames[dayIndex] || `Day ${dayIndex + 1}`,
    title: titleMap[dayType] || `${dayType} Workout`,
    duration: durationMap[level] || '60 min',
    focus: blueprint.map(b => b.target).filter((v, i, a) => a.indexOf(v) === i),
    exercises,
  };
}

// ─── TDEE & CALORIES (STEPS 5 & 6) ───────────────────────────────────────────
function getActivityMultiplier(q: any) {
  const a = normalizeText(q.physicalActivityLevel);
  if (a.includes('significant') || a.includes('intense')) return 1.725;
  if (a.includes('moderate')) return 1.55;
  if (a.includes('mild') || a.includes('light')) return 1.375;
  return 1.2;
}
function getBmr(q: any) {
  const w = Number(q.weight) || 70;
  const h = Number(q.height) || 170;
  const age = Number(q.age) || 25;
  const g = normalizeText(q.gender || q.sex);
  if (g.startsWith('f')) return 10 * w + 6.25 * h - 5 * age - 161;
  return 10 * w + 6.25 * h - 5 * age + 5;
}
function getTdee(q: any) { return Math.round(getBmr(q) * getActivityMultiplier(q)); }
function getDailyCalories(q: any, goal: string) {
  const tdee = getTdee(q);
  if (goal === 'Weight Loss') return Math.max(1200, tdee - 500);
  if (goal === 'Bulking') return tdee + 500;
  return tdee;
}
function getMacroTargets(goal: string, weightKg: number, calories: number) {
  let proteinPerKg = 1.8, fatPerKg = 0.8;
  if (goal === 'Weight Loss') { proteinPerKg = 2.2; fatPerKg = 0.75; }
  else if (goal === 'Bulking') { proteinPerKg = 2.0; fatPerKg = 0.9; }
  else if (goal === 'Lean Physique') { proteinPerKg = 2.2; fatPerKg = 0.8; }
  const protein = Math.round(weightKg * proteinPerKg);
  const fats = Math.round(weightKg * fatPerKg);
  const carbs = Math.max(90, Math.round((calories - protein * 4 - fats * 9) / 4));
  return { protein, carbs, fats };
}

// ─── MEAL PLAN BUILDER (STEP 7) ───────────────────────────────────────────────
function getDietType(q: any) {
  const r = normalizeText(q.dietaryRestrictions);
  if (r.includes('vegan')) return 'Vegan';
  if (r.includes('vegetarian')) return 'Vegetarian';
  if (r.includes('pescatarian')) return 'Pescatarian';
  if (r.includes('no red meat') || r.includes('no-red-meat')) return 'No Red Meat';
  return 'No Restrictions';
}
function getMealSlotNames(n: number) {
  const slots: Record<number, string[]> = {
    2: ['Breakfast', 'Dinner'],
    3: ['Breakfast', 'Lunch', 'Dinner'],
    4: ['Breakfast', 'Snack', 'Lunch', 'Dinner'],
    5: ['Breakfast', 'Snack', 'Lunch', 'Afternoon Snack', 'Dinner'],
    6: ['Breakfast', 'Snack', 'Lunch', 'Afternoon Snack', 'Pre-Workout', 'Dinner'],
  };
  return slots[n] || slots[4];
}
function getMealMacroWeights(n: number) {
  const w: Record<number, number[]> = {
    2: [0.45, 0.55], 3: [0.3, 0.35, 0.35], 4: [0.25, 0.15, 0.3, 0.3],
    5: [0.25, 0.1, 0.25, 0.1, 0.3], 6: [0.22, 0.08, 0.25, 0.08, 0.12, 0.25],
  };
  return w[n] || w[4];
}

const MEAL_BANKS: Record<string, Record<string, Array<Array<{ item: string; quantity: string }>>>> = {
  'No Restrictions': {
    Breakfast: [
      [{ item: 'Oats', quantity: '80g' }, { item: 'Eggs', quantity: '3 large' }, { item: 'Banana', quantity: '1 medium' }],
      [{ item: 'Greek yogurt', quantity: '250g' }, { item: 'Granola', quantity: '40g' }, { item: 'Berries', quantity: '1 cup' }],
      [{ item: 'Whole grain toast', quantity: '2 slices' }, { item: 'Scrambled eggs', quantity: '3 eggs' }, { item: 'Avocado', quantity: 'half' }],
      [{ item: 'Overnight oats', quantity: '80g' }, { item: 'Whey protein', quantity: '1 scoop' }, { item: 'Blueberries', quantity: 'half cup' }],
    ],
    Snack: [
      [{ item: 'Protein shake', quantity: '1 serving' }, { item: 'Apple', quantity: '1 medium' }],
      [{ item: 'Greek yogurt', quantity: '200g' }, { item: 'Almonds', quantity: '25g' }],
      [{ item: 'Cottage cheese', quantity: '150g' }, { item: 'Pineapple', quantity: '1 cup' }],
      [{ item: 'Rice cakes', quantity: '3 pieces' }, { item: 'Peanut butter', quantity: '2 tbsp' }],
    ],
    Lunch: [
      [{ item: 'Chicken breast', quantity: '180g' }, { item: 'Rice', quantity: '1.5 cups cooked' }, { item: 'Mixed vegetables', quantity: '1 cup' }],
      [{ item: 'Turkey wrap', quantity: '1 large' }, { item: 'Salad greens', quantity: '2 cups' }, { item: 'Olive oil', quantity: '1 tbsp' }],
      [{ item: 'Lean beef stir fry', quantity: '180g' }, { item: 'Jasmine rice', quantity: '1.5 cups' }, { item: 'Broccoli', quantity: '1 cup' }],
      [{ item: 'Tuna', quantity: '150g' }, { item: 'Quinoa', quantity: '1 cup cooked' }, { item: 'Spinach', quantity: '2 cups' }],
    ],
    'Afternoon Snack': [
      [{ item: 'Trail mix', quantity: '40g' }, { item: 'Banana', quantity: '1 medium' }],
      [{ item: 'Hard boiled eggs', quantity: '2 large' }, { item: 'Fruit', quantity: '1 serving' }],
      [{ item: 'Protein bar', quantity: '1 bar' }],
    ],
    'Pre-Workout': [
      [{ item: 'Banana', quantity: '1 medium' }, { item: 'Whey shake', quantity: '1 serving' }],
      [{ item: 'Oats', quantity: '50g' }, { item: 'Honey', quantity: '1 tbsp' }],
      [{ item: 'Rice cakes', quantity: '2 pieces' }, { item: 'Jam', quantity: '1 tbsp' }],
    ],
    Dinner: [
      [{ item: 'Salmon', quantity: '180g' }, { item: 'Sweet potato', quantity: '250g' }, { item: 'Asparagus', quantity: '1 cup' }],
      [{ item: 'Chicken pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }, { item: 'Olive oil', quantity: '1 tbsp' }],
      [{ item: 'Lean beef', quantity: '180g' }, { item: 'Brown rice', quantity: '1 cup' }, { item: 'Broccoli', quantity: '1 cup' }],
      [{ item: 'Egg fried rice', quantity: '2 cups' }, { item: 'Stir-fried vegetables', quantity: '1.5 cups' }],
    ],
  },
  Vegetarian: {
    Breakfast: [
      [{ item: 'Oats', quantity: '80g' }, { item: 'Greek yogurt', quantity: '200g' }, { item: 'Berries', quantity: '1 cup' }],
      [{ item: 'Tofu scramble', quantity: '200g' }, { item: 'Whole grain toast', quantity: '2 slices' }],
      [{ item: 'Paneer toast', quantity: '2 slices' }, { item: 'Fruit', quantity: '1 serving' }],
      [{ item: 'Smoothie bowl', quantity: '1 bowl' }, { item: 'Hemp seeds', quantity: '2 tbsp' }],
    ],
    Snack: [
      [{ item: 'Soy yogurt', quantity: '200g' }, { item: 'Walnuts', quantity: '25g' }],
      [{ item: 'Protein smoothie', quantity: '1 serving' }, { item: 'Banana', quantity: '1 medium' }],
      [{ item: 'Roasted chickpeas', quantity: '50g' }, { item: 'Apple', quantity: '1 medium' }],
    ],
    Lunch: [
      [{ item: 'Paneer rice bowl', quantity: '1 bowl' }, { item: 'Mixed vegetables', quantity: '1 cup' }],
      [{ item: 'Lentil curry', quantity: '1.5 cups' }, { item: 'Rice', quantity: '1.5 cups' }],
      [{ item: 'Chickpea quinoa salad', quantity: '1 large bowl' }, { item: 'Olive oil', quantity: '1 tbsp' }],
      [{ item: 'Tofu stir fry', quantity: '200g' }, { item: 'Rice noodles', quantity: '1.5 cups' }],
    ],
    'Afternoon Snack': [
      [{ item: 'Peanut butter sandwich', quantity: '1 serving' }],
      [{ item: 'Mixed nuts', quantity: '30g' }, { item: 'Fruit', quantity: '1 serving' }],
    ],
    'Pre-Workout': [
      [{ item: 'Banana', quantity: '1 medium' }, { item: 'Soy milk', quantity: '250ml' }],
      [{ item: 'Dates', quantity: '4 pieces' }, { item: 'Almonds', quantity: '15g' }],
    ],
    Dinner: [
      [{ item: 'Paneer curry', quantity: '180g' }, { item: 'Chapati', quantity: '3 pieces' }],
      [{ item: 'Vegetable pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }],
      [{ item: 'Tofu and vegetable bake', quantity: '300g' }, { item: 'Quinoa', quantity: '1 cup' }],
      [{ item: 'Egg fried rice', quantity: '2 cups' }, { item: 'Stir-fried vegetables', quantity: '1 cup' }],
    ],
  },
  Vegan: {
    Breakfast: [
      [{ item: 'Overnight oats', quantity: '80g' }, { item: 'Soy milk', quantity: '250ml' }, { item: 'Chia seeds', quantity: '1 tbsp' }],
      [{ item: 'Tofu scramble', quantity: '200g' }, { item: 'Whole grain toast', quantity: '2 slices' }],
      [{ item: 'Smoothie bowl', quantity: '1 bowl' }, { item: 'Peanut butter', quantity: '1 tbsp' }],
      [{ item: 'Oat porridge', quantity: '80g' }, { item: 'Plant protein powder', quantity: '1 scoop' }, { item: 'Banana', quantity: '1 medium' }],
    ],
    Snack: [
      [{ item: 'Soy yogurt', quantity: '200g' }, { item: 'Berries', quantity: '1 cup' }],
      [{ item: 'Hummus', quantity: '4 tbsp' }, { item: 'Carrot sticks', quantity: '1 cup' }],
      [{ item: 'Roasted chickpeas', quantity: '50g' }],
    ],
    Lunch: [
      [{ item: 'Lentil rice bowl', quantity: '1 large bowl' }, { item: 'Mixed vegetables', quantity: '1 cup' }],
      [{ item: 'Chickpea curry', quantity: '1.5 cups' }, { item: 'Rice', quantity: '1.5 cups' }],
      [{ item: 'Tofu quinoa salad', quantity: '1 large bowl' }, { item: 'Avocado', quantity: 'half' }],
      [{ item: 'Black bean wrap', quantity: '1 large' }, { item: 'Salad greens', quantity: '2 cups' }],
    ],
    'Afternoon Snack': [
      [{ item: 'Trail mix', quantity: '40g' }],
      [{ item: 'Banana', quantity: '1 medium' }, { item: 'Almond butter', quantity: '1 tbsp' }],
    ],
    'Pre-Workout': [
      [{ item: 'Banana', quantity: '1 medium' }, { item: 'Oats', quantity: '40g' }],
      [{ item: 'Dates', quantity: '4 pieces' }, { item: 'Soy milk', quantity: '250ml' }],
    ],
    Dinner: [
      [{ item: 'Tempeh stir fry', quantity: '180g' }, { item: 'Rice noodles', quantity: '1.5 cups' }],
      [{ item: 'Bean chili', quantity: '1.5 cups' }, { item: 'Sweet potato', quantity: '250g' }],
      [{ item: 'Tofu pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }],
      [{ item: 'Lentil soup', quantity: '2 cups' }, { item: 'Whole grain bread', quantity: '2 slices' }],
    ],
  },
  Pescatarian: {
    Breakfast: [
      [{ item: 'Oats', quantity: '80g' }, { item: 'Greek yogurt', quantity: '200g' }, { item: 'Berries', quantity: '1 cup' }],
      [{ item: 'Egg omelette', quantity: '3 eggs' }, { item: 'Whole grain toast', quantity: '2 slices' }],
      [{ item: 'Smoked salmon', quantity: '100g' }, { item: 'Whole grain toast', quantity: '2 slices' }, { item: 'Avocado', quantity: 'half' }],
    ],
    Snack: [
      [{ item: 'Protein shake', quantity: '1 serving' }, { item: 'Apple', quantity: '1 medium' }],
      [{ item: 'Greek yogurt', quantity: '200g' }, { item: 'Walnuts', quantity: '20g' }],
    ],
    Lunch: [
      [{ item: 'Salmon rice bowl', quantity: '1 large bowl' }, { item: 'Vegetables', quantity: '1 cup' }],
      [{ item: 'Tuna wrap', quantity: '1 large' }, { item: 'Salad greens', quantity: '2 cups' }],
      [{ item: 'Prawn stir fry', quantity: '180g' }, { item: 'Rice', quantity: '1.5 cups' }],
    ],
    'Afternoon Snack': [
      [{ item: 'Rice cakes', quantity: '3 pieces' }, { item: 'Cottage cheese', quantity: '150g' }],
    ],
    'Pre-Workout': [
      [{ item: 'Banana', quantity: '1 medium' }, { item: 'Whey shake', quantity: '1 serving' }],
    ],
    Dinner: [
      [{ item: 'Grilled fish', quantity: '180g' }, { item: 'Sweet potato', quantity: '250g' }, { item: 'Green beans', quantity: '1 cup' }],
      [{ item: 'Shrimp pasta', quantity: '2 cups' }, { item: 'Side salad', quantity: '1 bowl' }],
      [{ item: 'Baked salmon', quantity: '200g' }, { item: 'Brown rice', quantity: '1 cup' }, { item: 'Asparagus', quantity: '1 cup' }],
    ],
  },
  'No Red Meat': {
    Breakfast: [
      [{ item: 'Oats', quantity: '80g' }, { item: 'Eggs', quantity: '3 large' }, { item: 'Berries', quantity: '1 cup' }],
      [{ item: 'Greek yogurt', quantity: '250g' }, { item: 'Granola', quantity: '40g' }],
      [{ item: 'Whole grain toast', quantity: '2 slices' }, { item: 'Scrambled eggs', quantity: '3 eggs' }, { item: 'Avocado', quantity: 'half' }],
    ],
    Snack: [
      [{ item: 'Protein shake', quantity: '1 serving' }, { item: 'Banana', quantity: '1 medium' }],
      [{ item: 'Cottage cheese', quantity: '150g' }, { item: 'Almonds', quantity: '20g' }],
    ],
    Lunch: [
      [{ item: 'Chicken rice bowl', quantity: '1 large bowl' }, { item: 'Vegetables', quantity: '1 cup' }],
      [{ item: 'Turkey sandwich', quantity: '1 large' }, { item: 'Fruit', quantity: '1 serving' }],
      [{ item: 'Salmon salad', quantity: '200g' }, { item: 'Quinoa', quantity: '1 cup' }],
    ],
    'Afternoon Snack': [
      [{ item: 'Rice cakes', quantity: '3 pieces' }, { item: 'Peanut butter', quantity: '2 tbsp' }],
    ],
    'Pre-Workout': [
      [{ item: 'Banana', quantity: '1 medium' }, { item: 'Whey shake', quantity: '1 serving' }],
    ],
    Dinner: [
      [{ item: 'Salmon', quantity: '180g' }, { item: 'Sweet potato', quantity: '250g' }, { item: 'Broccoli', quantity: '1 cup' }],
      [{ item: 'Chicken pasta', quantity: '2 cups' }, { item: 'Salad', quantity: '1 bowl' }],
      [{ item: 'Grilled turkey', quantity: '180g' }, { item: 'Brown rice', quantity: '1 cup' }, { item: 'Mixed vegetables', quantity: '1 cup' }],
    ],
  },
};

function buildMealItems(dietType: string, slot: string, dayIndex: number, seed: number) {
  const bank = MEAL_BANKS[dietType] || MEAL_BANKS['No Restrictions'];
  const options = bank[slot] || bank['Breakfast'];
  const slotHash = [...slot].reduce((t, c) => t + c.charCodeAt(0), 0);
  // Use prime-based rotation for day variety
  const idx = (seed + dayIndex * 11 + slotHash * 7) % options.length;
  return (options[idx] || options[0]).map(i => ({ item: i.item, quantity: i.quantity }));
}

function getPlanSeed(q: any): number {
  const src = [q.gender, q.age, q.height, q.weight, q.goal, q.commitmentPeriod, q.physicalActivityLevel,
  q.daysPerWeek ?? q.exerciseDaysPerWeek, q.exerciseCapability, q.dietaryRestrictions]
    .map(v => normalizeText(v)).join('|');
  let hash = 0;
  for (let i = 0; i < src.length; i++) hash = (hash * 31 + src.charCodeAt(i)) >>> 0;
  return hash;
}

function buildMealPlan(q: any, level: string, goal: string, seed: number) {
  const weightKg = Number(q.weight) || 70;
  const mealsPerDay = Math.min(6, Math.max(2, Number(q.mealsPerDay) || 4));
  const dietType = getDietType(q);
  const calories = getDailyCalories(q, goal);
  const macros = getMacroTargets(goal, weightKg, calories);
  const mealSlots = getMealSlotNames(mealsPerDay);
  const mealWeights = getMealMacroWeights(mealsPerDay);

  // Pre-calculate per-meal targets
  const perMealCalories = mealSlots.map((_, i) => Math.max(150, Math.round(calories * (mealWeights[i] || 1 / mealsPerDay))));
  const perMealProtein = mealSlots.map((_, i) => Math.max(10, Math.round(macros.protein * (mealWeights[i] || 1 / mealsPerDay))));
  const perMealCarbs = mealSlots.map((_, i) => Math.max(10, Math.round(macros.carbs * (mealWeights[i] || 1 / mealsPerDay))));
  const perMealFats = mealSlots.map((_, i) => Math.max(5, Math.round(macros.fats * (mealWeights[i] || 1 / mealsPerDay))));

  const weeklyPlan = Array.from({ length: 7 }, (_, dayIndex) => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = mealSlots.map((slot, mi) => ({
      type: slot,        // for transformer
      mealType: slot,    // for DB schema
      time: ['7:00 AM', '9:30 AM', '12:30 PM', '3:30 PM', '5:30 PM', '7:30 PM'][mi] || '',
      calories: perMealCalories[mi],
      protein: perMealProtein[mi],
      carbs: perMealCarbs[mi],
      fats: perMealFats[mi],
      fat: perMealFats[mi],
      items: buildMealItems(dietType, slot, 0, seed),
    }));
    return {
      day: dayNames[dayIndex],
      meals,
      // Explicit totals for transformer fallback — store on both top-level and dayTotal
      totalCalories: calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats,
      fat: macros.fats,
      dayTotal: { calories, protein: macros.protein, carbs: macros.carbs, fats: macros.fats },
    };
  });

  const allowedProteins = dietType === 'Vegan'
    ? ['tofu', 'tempeh', 'lentils', 'chickpeas', 'soy protein']
    : dietType === 'Vegetarian' ? ['eggs', 'Greek yogurt', 'paneer', 'tofu', 'lentils']
      : dietType === 'Pescatarian' ? ['fish', 'salmon', 'tuna', 'eggs', 'Greek yogurt']
        : dietType === 'No Red Meat' ? ['chicken', 'turkey', 'fish', 'eggs', 'Greek yogurt']
          : ['chicken', 'eggs', 'fish', 'Greek yogurt', 'lean beef'];

  const supplements = isYesLike(q.openToSupplements)
    ? dietType === 'Vegan' ? ['Plant protein powder', 'Creatine monohydrate', 'Vitamin B12']
      : ['Whey protein', 'Creatine monohydrate', 'Omega-3']
    : [];

  return {
    title: `${goal} - Meal Plan`, goal, dietType,
    duration: q.commitmentPeriod || '3 months',
    dailyCalories: calories, dailyProtein: macros.protein, dailyCarbs: macros.carbs, dailyFat: macros.fats,
    protein: macros.protein, carbs: macros.carbs, fats: macros.fats,
    mealsPerDay,
    nutritionTips: goal === 'Weight Loss'
      ? 'Prioritize lean protein, high-fiber vegetables, and consistent meal timing to support satiety.'
      : goal === 'Bulking' ? 'Use calorie-dense nutritious meals and spread protein evenly through the day.'
        : 'Build each meal around protein, colorful produce, and quality carbs for steady energy.',
    shoppingList: [
      { category: 'Protein', items: allowedProteins },
      { category: 'Carbs', items: ['oats', 'rice', 'potatoes', 'whole grain bread', 'fruit'] },
      { category: 'Vegetables', items: ['spinach', 'broccoli', 'mixed vegetables', 'greens', 'tomatoes'] },
      { category: 'Fats', items: ['olive oil', 'avocado', 'nuts', 'seeds', 'peanut butter'] },
    ],
    notes: 'Adjust portions based on progress, recovery, and energy levels.',
    guidelines: [
      `Follow ${mealsPerDay} meals per day with consistent protein distribution.`,
      dietType === 'Vegan' || dietType === 'Vegetarian'
        ? 'Use plant protein combinations to hit daily protein targets.'
        : 'Include a protein source at every meal.',
      'Keep most meals minimally processed and centered on whole foods.',
    ],
    hydrationGuidance: hasDigestiveIssue(q)
      ? 'Sip fluids throughout the day and avoid large meals close to training.'
      : 'Aim for 2.5-3L of water daily; increase around training sessions.',
    supplements,
    weeklyPlan,
    weeks: [{ week: 'Week 1', days: weeklyPlan }],
  };
}

function buildWorkoutPlan(q: any, level: string, goal: string, seed: number) {
  const environment = determineWorkoutEnvironment(q);
  const daysPerWeek = getTrainingDays(q);
  const split = getWorkoutSplit(level, daysPerWeek);
  const workoutDays = split.map((cfg, i) => buildWorkoutDay(cfg.type, environment, level, i, seed));
  const focusLabel = level === 'Beginner' ? 'Full Body'
    : daysPerWeek >= 6 ? 'Push / Pull / Legs'
      : daysPerWeek === 5 && level === 'Advanced' ? 'Bro Split (Chest / Back / Shoulders / Arms / Legs)'
        : daysPerWeek === 4 ? 'Upper / Lower'
          : 'Push / Pull / Legs';
  return {
    title: `${goal} - ${level} Plan`, goal, level,
    duration: q.commitmentPeriod || '3 months',
    frequency: `${daysPerWeek} days/week`,
    focus: focusLabel,
    notes: level === 'Beginner'
      ? 'Keep the plan simple, focus on movement quality, and progress gradually each week.'
      : level === 'Intermediate' ? 'Progress loads steadily while maintaining good form and balanced weekly volume.'
        : 'Use a structured overload strategy and manage fatigue with recovery-focused programming.',
    warmup: level === 'Beginner'
      ? '5-10 minutes of light cardio, joint circles, and movement prep.'
      : '5-10 minutes of cardio, mobility work, and ramp-up sets before working weight.',
    cooldown: 'Finish with 5 minutes of light stretching and controlled breathing.',
    progressionStrategy: level === 'Beginner'
      ? 'Add reps first, then increase load once all sets feel controlled.'
      : level === 'Intermediate' ? 'Increase weight when all working sets are completed at the top of the rep range.'
        : 'Use top sets, back-off sets, and planned load increases across mesocycles.',
    weeks: [{ weekNumber: 1, days: workoutDays, focusAreas: split.map(d => d.title) }],
  };
}

function buildDeterministicPlans(q: any): GeneratedPlans {
  const goal = determineFitnessGoal(q);
  const level = determineFitnessLevel(q);
  const seed = getPlanSeed(q);
  return {
    workoutPlan: buildWorkoutPlan(q, level, goal, seed),
    mealPlan: buildMealPlan(q, level, goal, seed),
  };
}

// ─── NORMALIZE & VALIDATE ────────────────────────────────────────────────────
function normalizePlans(raw: any): GeneratedPlans | null {
  if (!raw?.workoutPlan || !raw?.mealPlan) return null;
  const wp = raw.workoutPlan;
  const mp = raw.mealPlan;

  const normalizedWorkoutWeeks = (wp.weeks || []).map((week: any) => ({
    ...week,
    days: (week.days || []).map((day: any) => ({
      ...day,
      exercises: (day.exercises || []).map((ex: any) => ({
        ...ex,
        name: ex.name || ex.exercise || 'Exercise',
        exercise: ex.exercise || ex.name || 'Exercise',
      })),
    })),
  }));

  const mealWeekSource = mp.weeks || (mp.weeklyPlan ? [{ week: 'Week 1', days: mp.weeklyPlan }] : []);
  const normalizedMealWeeks = mealWeekSource.map((week: any) => {
    let days = week.days || [];
    if (days.length === 1) {
      days = Array.from({ length: 7 }, (_, i) => ({
        ...days[0],
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
      }));
    }
    return {
      ...week,
      days: days.map((day: any) => ({
        ...day,
        totalCalories: day.totalCalories ?? day.dayTotal?.calories ?? day.calories ?? 0,
      protein: day.protein ?? day.dayTotal?.protein ?? 0,
      carbs: day.carbs ?? day.dayTotal?.carbs ?? 0,
      fats: day.fats ?? day.dayTotal?.fats ?? day.fat ?? 0,
      fat: day.fat ?? day.fats ?? day.dayTotal?.fats ?? 0,
      meals: (day.meals || []).map((meal: any) => ({
        ...meal,
        type: meal.type || meal.mealType || 'Meal',
        mealType: meal.mealType || meal.type || 'Meal',
        calories: meal.calories ?? 0,
        protein: meal.protein ?? 0,
        carbs: meal.carbs ?? 0,
        fats: meal.fats ?? meal.fat ?? 0,
        fat: meal.fat ?? meal.fats ?? 0,
        items: (meal.items || []).map((item: any) =>
          typeof item === 'string'
            ? { item, name: item }
            : { ...item, item: item.item || item.name, name: item.name || item.item }
        ),
      })),
    }))
    };
  });

  const weeklyPlan = normalizedMealWeeks[0]?.days?.map((day: any) => ({
    day: day.day,
    meals: day.meals,
    totalCalories: day.totalCalories,
    protein: day.protein,
    carbs: day.carbs,
    fats: day.fats,
    fat: day.fat,
    dayTotal: { calories: day.totalCalories, protein: day.protein, carbs: day.carbs, fats: day.fats },
  })) || [];

  const rawSL = mp.shoppingList;
  const shoppingList = Array.isArray(rawSL) ? rawSL
    : typeof rawSL === 'string'
      ? [{ category: 'General', items: rawSL.split(',').map((s: string) => s.trim()).filter(Boolean) }]
      : [];

  return {
    workoutPlan: { ...wp, weeks: normalizedWorkoutWeeks },
    mealPlan: {
      ...mp,
      dailyCalories: mp.dailyCalories ?? mp.calories ?? 0,
      dailyProtein: mp.dailyProtein ?? mp.protein ?? 0,
      dailyCarbs: mp.dailyCarbs ?? mp.carbs ?? 0,
      dailyFat: mp.dailyFat ?? mp.fats ?? mp.fat ?? 0,
      protein: mp.protein ?? mp.dailyProtein ?? 0,
      carbs: mp.carbs ?? mp.dailyCarbs ?? 0,
      fats: mp.fats ?? mp.dailyFat ?? 0,
      weeks: normalizedMealWeeks,
      weeklyPlan,
      shoppingList,
    },
  };
}

function validatePlansShape(plans: GeneratedPlans) {
  const issues: { path: string; message: string }[] = [];
  if (!plans.workoutPlan?.weeks?.length) issues.push({ path: 'workoutPlan.weeks', message: 'No weeks' });
  if (!plans.mealPlan?.weeks?.length) issues.push({ path: 'mealPlan.weeks', message: 'No weeks' });
  const wDays = plans.workoutPlan?.weeks?.[0]?.days || [];
  if (!wDays.length) issues.push({ path: 'workoutPlan.weeks[0].days', message: 'No days' });
  if (wDays.some((d: any) => !d.exercises?.length)) issues.push({ path: 'exercises', message: 'Day missing exercises' });
  const mDays = plans.mealPlan?.weeks?.[0]?.days || [];
  if (!mDays.length) issues.push({ path: 'mealPlan.weeks[0].days', message: 'No days' });
  if (mDays.some((d: any) => !d.meals?.length)) issues.push({ path: 'meals', message: 'Day missing meals' });
  return issues;
}

// ─── GROQ AI GENERATION ───────────────────────────────────────────────────────
async function generatePlansWithGroq(q: any, requestId: string): Promise<GeneratedPlans | null> {
  if (!GROQ_API_KEY) { logAiEvent('GROQ_API_KEY missing', { requestId }); return null; }

  const level = determineFitnessLevel(q);
  const goal = determineFitnessGoal(q);
  const daysPerWeek = getTrainingDays(q);
  const tdee = getTdee(q);
  const calories = getDailyCalories(q, goal);
  const weightKg = Number(q.weight) || 70;
  const macros = getMacroTargets(goal, weightKg, calories);
  const dietType = getDietType(q);
  const mealsPerDay = Math.min(6, Math.max(2, Number(q.mealsPerDay) || 4));

  const splitRule = level === 'Beginner' ? 'Full Body ONLY'
    : daysPerWeek >= 6 ? 'Push/Pull/Legs x2'
      : daysPerWeek === 5 && level === 'Advanced' ? 'Bro Split: Chest, Back, Shoulders, Arms, Legs'
        : daysPerWeek === 4 ? 'Upper/Lower x2'
          : 'Push/Pull/Legs';

  const exerciseRule = level === 'Beginner'
    ? 'EXACTLY 6 exercises per day: 1 Leg, 1 Chest, 1 Back, 1 Shoulder, 1 Tricep, 1 Bicep'
    : '6 exercises per day, 2-3 per muscle group in session';

  const prefFoods = [];
  if (q.proteinSources?.length) prefFoods.push(`Protein: ${q.proteinSources.join(', ')}`);
  if (q.carbSources?.length) prefFoods.push(`Carbs: ${q.carbSources.join(', ')}`);
  const prefFoodsText = prefFoods.length ? `Preferred Foods: ${prefFoods.join('; ')}` : '';

  const prompt = `You are a strict rule-based fitness engine. Output ONLY valid JSON, no extra text.

USER: Level=${level}, Goal=${goal}, Days/week=${daysPerWeek}, Environment=${determineWorkoutEnvironment(q)}, Diet=${dietType}, Meals/day=${mealsPerDay}
TDEE=${tdee}, TargetCalories=${calories}, Protein=${macros.protein}g, Carbs=${macros.carbs}g, Fats=${macros.fats}g
${prefFoodsText ? `USER PREFERRED FOODS: ${prefFoodsText}` : ''}

RULES:
1. Workout split: ${splitRule}
2. Exercises: ${exerciseRule}, sets ${level === 'Beginner' ? '3' : '4'} per exercise. CRITICAL: For 'name' and 'exercise' fields, provide the SPECIFIC exercise name (e.g. "Barbell Bench Press", "Squat"). DO NOT output just the body part!
3. Output exactly ${daysPerWeek} training days
4. Different exercises each day for same muscle group
5. Meal plan: Create exactly 1 day of meals (${mealsPerDay} meals/day). Output exactly 1 day in the JSON under mealPlan.weeks[0].days.
${prefFoodsText ? `6. CRITICAL: The user has requested specific foods. You MUST construct the meal plan using ONLY these preferred foods where possible. Do not add unnecessary variety.` : '6. Keep the meals simple and repeat the same 1 day for the week.'}
7. Each day macro totals: ${calories} kcal, ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fats}g fats

Respond with this JSON structure ONLY:
{"workoutPlan":{"title":"string","goal":"${goal}","level":"${level}","duration":"string","frequency":"${daysPerWeek} days/week","focus":"${splitRule}","notes":"string","weeks":[{"weekNumber":1,"days":[{"day":"string","title":"string","duration":"string","focus":["string"],"exercises":[{"name":"string","exercise":"string","sets":${level === 'Beginner' ? '3' : '4'},"reps":"string","rest":"string","target":"string","notes":"string"}]}]}]},"mealPlan":{"title":"string","goal":"${goal}","dietType":"${dietType}","dailyCalories":${calories},"dailyProtein":${macros.protein},"dailyCarbs":${macros.carbs},"dailyFat":${macros.fats},"protein":${macros.protein},"carbs":${macros.carbs},"fats":${macros.fats},"nutritionTips":"string","notes":"string","weeks":[{"week":"Week 1","days":[{"day":"string","totalCalories":${calories},"protein":${macros.protein},"carbs":${macros.carbs},"fats":${macros.fats},"fat":${macros.fats},"dayTotal":{"calories":${calories},"protein":${macros.protein},"carbs":${macros.carbs},"fats":${macros.fats}},"meals":[{"type":"string","mealType":"string","time":"string","calories":0,"protein":0,"carbs":0,"fats":0,"fat":0,"items":[{"item":"string","quantity":"string"}]}]}]}]}}`;

  let response: any;
  try {
    response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 8000,
    });
  } catch (err: any) {
    logAiEvent('Groq request failed', { requestId, message: err?.message });
    return null;
  }

  const text = response?.choices?.[0]?.message?.content || '';
  if (!text.trim()) { logAiEvent('Groq empty response', { requestId }); return null; }

  const jsonBlock = extractJsonBlock(text) || text;
  try {
    const parsed = JSON.parse(jsonBlock);
    const normalized = normalizePlans(parsed);
    if (!normalized) { logAiEvent('Groq missing keys', { requestId }); return null; }
    const issues = validatePlansShape(normalized);
    if (issues.length > 0) { logAiEvent('Groq validation failed', { requestId, issues }); return null; }
    logAiEvent('Groq plan accepted', { requestId });
    return normalized;
  } catch (err: any) {
    logAiEvent('Groq parse failed', { requestId, message: err?.message, sample: jsonBlock.slice(0, 300) });
    return null;
  }
}

async function createPlanVersion(userId: string, qId: string | null, workoutPlan: any, mealPlan: any) {
  const [savedWorkoutPlan, savedMealPlan] = await Promise.all([
    WorkoutPlan.create({ userId, questionnaireId: qId || undefined, ...workoutPlan }),
    MealPlan.create({ userId, questionnaireId: qId || undefined, ...mealPlan }),
  ]);
  return { savedWorkoutPlan, savedMealPlan };
}

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID();
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let decoded: any;
    try { decoded = jwt.verify(token, JWT_SECRET); }
    catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const q = await request.json();
    const level = determineFitnessLevel(q);
    const goal = determineFitnessGoal(q);
    console.log(`🤖 [PLAN] Level=${level}, Goal=${goal}, Days=${getTrainingDays(q)}, Calories=${getDailyCalories(q, goal)}`);

    const deterministicPlans = buildDeterministicPlans(q);
    const useAI = process.env.ENABLE_AI_PLAN_GENERATION === 'true' && !!GROQ_API_KEY;
    const aiPlans = useAI ? await generatePlansWithGroq(q, requestId) : null;

    if (aiPlans) console.log('✅ [PLAN] Using AI-generated plan');
    else console.log('✅ [PLAN] Using deterministic plan');

    const raw = aiPlans || deterministicPlans;
    const plans = normalizePlans(raw) || normalizePlans(deterministicPlans) || deterministicPlans;

    const savedQ = await Questionnaire.findOne({ userId: decoded.id }).sort({ updatedAt: -1 });
    const qId = savedQ?._id ? String(savedQ._id) : null;
    const { savedWorkoutPlan, savedMealPlan } = await createPlanVersion(decoded.id, qId, plans.workoutPlan, plans.mealPlan);

    return NextResponse.json({ message: 'Plans generated successfully', data: { workoutPlan: savedWorkoutPlan, mealPlan: savedMealPlan } }, { status: 200 });
  } catch (error: any) {
    console.error('❌ [PLAN] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate plans' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let decoded: any;
    try { decoded = jwt.verify(token, JWT_SECRET); }
    catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const workoutPlan = await WorkoutPlan.findOne({ userId: decoded.id }).sort({ createdAt: -1 });
    const mealPlan = await MealPlan.findOne({ userId: decoded.id }).sort({ createdAt: -1 });
    const workoutHistory = await WorkoutPlan.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(12);
    const mealHistory = await MealPlan.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(12);

    return NextResponse.json({ message: 'Plans retrieved', data: { workoutPlan, mealPlan, workoutHistory, mealHistory } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve plans' }, { status: 500 });
  }
}

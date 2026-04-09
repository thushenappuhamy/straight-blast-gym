import mongoose from 'mongoose';

interface WorkoutDay {
  day: string;
  title: string;
  exercises: Array<{
    id: string;
    exercise: string;
    sets: number;
    reps: string;
    rest: string;
    target: string;
    notes?: string;
  }>;
}

interface WorkoutWeek {
  weekNumber: number;
  days: WorkoutDay[];
  focusAreas: string[];
}

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionnaireId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire',
    },
    // Basic Info
    title: String,
    goal: String,
    level: String, // Beginner, Intermediate, Advanced
    duration: String, // e.g., "12 weeks"
    frequency: String, // e.g., "5 days/week"
    
    // Detailed Plan
    weeks: [
      {
        weekNumber: Number,
        days: [
          {
            day: String,
            title: String,
            duration: String,
            focus: [String],
            exercises: [
              {
                id: String,
                exercise: String,
                sets: Number,
                reps: String,
                rest: String,
                target: String,
                notes: String,
              },
            ],
          },
        ],
      },
    ],
    
    // Overview
    warmup: String,
    cooldown: String,
    progressionStrategy: String,
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const WorkoutPlan =
  mongoose.models.WorkoutPlan ||
  mongoose.model('WorkoutPlan', workoutPlanSchema);

import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
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
    goal: String,
    dietType: String,
    duration: String,
    
    // Macros
    dailyCalories: Number,
    protein: Number, // grams
    carbs: Number, // grams
    fats: Number, // grams
    
    // Meal Structure
    mealsPerDay: Number,
    
    // Weekly Meal Plan
    weeklyPlan: [
      {
        day: String,
        meals: [
          {
            mealType: String, // BREAKFAST, LUNCH, DINNER, SNACK
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number,
            items: [
              {
                name: String,
                quantity: String,
                notes: String,
              },
            ],
          },
        ],
        dayTotal: {
          calories: Number,
          protein: Number,
          carbs: Number,
          fats: Number,
        },
      },
    ],
    
    // Guidelines
    guidelines: [String],
    mealPrepTips: String,
    shoppingList: [
      {
        category: String,
        items: [String],
      },
    ],
    hydrationGuidance: String,
    supplements: [String],
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

export const MealPlan =
  mongoose.models.MealPlan || mongoose.model('MealPlan', mealPlanSchema);

import mongoose from 'mongoose';

const planQuestionnaireSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Personal Information
    name: String,
    age: Number,
    height: Number,
    weight: Number,

    // Dietary Restrictions
    dietaryRestrictions: {
      type: String,
      enum: ['no-restrictions', 'vegetarian', 'vegan', 'pescatarian', 'no-red-meat'],
    },

    // Food Allergies
    foodAllergies: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no',
    },
    allergyDetails: String,

    // Supplements
    openToSupplements: {
      type: String,
      enum: ['yes', 'no'],
      default: 'yes',
    },

    // Exercise Background (multiple selection)
    exerciseBackground: [
      {
        type: String,
        enum: ['walking', 'cycling', 'yoga', 'gym'],
      },
    ],

    // Medical Conditions
    medicalConditions: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no',
    },
    medicalConditionDetails: String,

    // Commitment Period
    commitmentPeriod: {
      type: String,
      enum: ['1-month', '3-months', '6-months', '12-months'],
    },

    // Physical Activity Level
    physicalActivityLevel: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'significant', 'intense'],
    },

    // Fitness Goals
    fitnessGoals: [
      {
        type: String,
        enum: ['weight-loss', 'staying-healthy', 'bulking', 'lean-muscle'],
      },
    ],

    // Favorite Protein Sources (multiple selection)
    proteinSources: [
      {
        type: String,
        enum: ['plant-based', 'eggs', 'chicken', 'seafood', 'beef', 'pork'],
      },
    ],

    // GERD/Digestive Issues
    gastroproblem: {
      type: String,
      enum: ['no', 'acid-reflux', 'bloating'],
    },

    // Diet Commitment Level
    dietCommitment: {
      type: String,
      enum: ['three-meals', 'frequent-meals', 'intermittent-fasting', 'keto'],
    },

    // Exercise Location Capability
    exerciseLocation: {
      type: String,
      enum: ['home-cardio', 'home-workouts', 'home-plus-outdoor'],
    },

    // Days Per Week for Exercise
    exerciseDaysPerWeek: {
      type: String,
      enum: ['1-2', '3', '4-5', '6-plus'],
    },

    // Sleep Hours
    sleepHours: {
      type: String,
      enum: ['less-4', '4-6', 'more-6'],
    },

    // Wake Up Time
    wakeUpTime: {
      type: String,
      enum: ['3-4am', '4-5am', '5-7am', 'after-7am'],
    },

    // Meals Per Day
    mealsPerDay: Number,

    // Favorite Carb Sources (multiple selection)
    carbSources: [
      {
        type: String,
        enum: ['rice', 'pasta', 'whole-grain', 'yams', 'other'],
      },
    ],

    // Daily Exercise Hours
    exerciseHoursPerDay: {
      type: String,
      enum: ['30-min', '1-hour', '2-hours', 'more-2-hours'],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const PlanQuestionnaire =
  mongoose.models.PlanQuestionnaire ||
  mongoose.model('PlanQuestionnaire', planQuestionnaireSchema);

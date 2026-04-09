import mongoose from 'mongoose';

const questionnaireSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Personal Info
    name: String,
    age: Number,
    height: Number,
    weight: Number,

    // Dietary
    dietaryRestrictions: String, // no restrictions, vegetarian, vegan, etc.
    foodAllergies: Boolean,
    allergiesDescription: String,
    supplements: Boolean,

    // Exercise
    exerciseBackground: [String], // array of selected exercises
    medicalConditions: Boolean,
    medicalDescription: String,

    // Commitment
    commitmentPeriod: String, // 1 month, 3 months, 6 months, 12 months
    physicalActivityLevel: String,
    goal: String, // Weight Loss, Staying healthy, Bulking, Lean muscle

    // Protein & Carbs
    proteinSources: [String],
    carbSources: [String],

    // GERD
    gerd: [String], // No, Acid Reflux, Bloating

    // Diet Commitment
    dietCommitment: String,
    exerciseCapability: String,
    daysPerWeek: String,
    sleepHours: String,
    wakeUpTime: String,
    mealsPerDay: Number,
    exerciseHoursPerDay: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Questionnaire =
  mongoose.models.Questionnaire || mongoose.model('Questionnaire', questionnaireSchema);

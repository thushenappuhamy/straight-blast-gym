import mongoose from 'mongoose';

export interface ITrainer extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  qualifications: string[];
  certifications: string[];
  experience: number; // in years
  bio: string;
  totalClients: number;
  ratingAverage: number;
  sessionsThisMonth: number;
  costPerSession: number; // in LKR
  status: 'active' | 'inactive' | 'on-leave';
  isFeatured: boolean;
  specializations: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new mongoose.Schema<ITrainer>(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    specialty: {
      type: String,
      required: [true, 'Please provide specialty'],
      enum: [
        'Strength & Conditioning',
        'Nutrition & Weight Loss',
        'Bodybuilding & Hypertrophy',
        'Functional Training',
        'Yoga & Flexibility',
        'CrossFit',
        'HIIT & Cardio',
        'Powerlifting',
        'Boxing & MMA',
      ],
    },
    qualifications: [
      {
        type: String,
        enum: [
          'Bachelor of Science in Sports Science',
          'Bachelor of Science in Nutrition',
          'Certified Personal Trainer (CPT)',
          'Advanced Diploma in Fitness',
          'Diploma in Sports Medicine',
          'Yoga Instructor Certification',
          'Nutrition Specialist Certification',
        ],
      },
    ],
    certifications: [
      {
        type: String,
      },
    ],
    experience: {
      type: Number,
      required: [true, 'Please provide years of experience'],
      min: 0,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    totalClients: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    sessionsThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    costPerSession: {
      type: Number,
      required: [true, 'Please provide cost per session in LKR'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    specializations: [
      {
        type: String,
        enum: ['MMA', 'Powerlifting', 'BJJ', 'Cardio', 'HIIT', 'Nutrition', 'Hypertrophy', 'Posing', 'Yoga', 'CrossFit', 'Boxing'],
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const Trainer =
  mongoose.models.Trainer || mongoose.model<ITrainer>('Trainer', TrainerSchema);

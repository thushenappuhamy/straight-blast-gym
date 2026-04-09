import mongoose, { Schema, Document } from 'mongoose';

export interface IMemberProfile extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipPlan: 'basic' | 'gold' | 'elite';
  membershipStartDate: Date;
  membershipEndDate: Date;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  paymentDate?: Date;
  transactionId?: string;
  fingerprintId?: string;
  isActive: boolean;
  registrationSource: 'admin' | 'user'; // admin added vs user self-registered
  createdAt: Date;
  updatedAt: Date;
}

const MemberProfileSchema = new Schema<IMemberProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    membershipPlan: {
      type: String,
      enum: ['basic', 'gold', 'elite'],
      default: 'basic',
      required: true,
    },
    membershipStartDate: {
      type: Date,
      default: Date.now,
    },
    membershipEndDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit-card', 'debit-card', 'upi', 'net-banking', 'manual'],
      default: 'manual',
    },
    paymentDate: {
      type: Date,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    fingerprintId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registrationSource: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
MemberProfileSchema.index({ userId: 1 });
MemberProfileSchema.index({ email: 1 });
MemberProfileSchema.index({ fingerprintId: 1 });
MemberProfileSchema.index({ membershipEndDate: 1 });

export const MemberProfile =
  mongoose.models.MemberProfile ||
  mongoose.model<IMemberProfile>('MemberProfile', MemberProfileSchema);

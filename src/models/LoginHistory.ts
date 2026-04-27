import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  loginTime: Date;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  country?: string;
  city?: string;
  status: 'success' | 'failed';
  failureReason?: string;
  createdAt: Date;
}

const LoginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    loginTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
    country: String,
    city: String,
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    failureReason: String,
  },
  { timestamps: true }
);

// Index for better query performance
LoginHistorySchema.index({ email: 1, loginTime: -1 });
LoginHistorySchema.index({ userId: 1, loginTime: -1 });
LoginHistorySchema.index({ role: 1, loginTime: -1 });

export const LoginHistory =
  mongoose.models.LoginHistory || mongoose.model('LoginHistory', LoginHistorySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  memberProfileId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  fingerprintId?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number; // in minutes
  date: Date;
  attendanceType: 'fingerprint' | 'manual';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    memberProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'MemberProfile',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fingerprintId: {
      type: String,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    checkOutTime: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
    },
    date: {
      type: Date,
      default: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
    },
    attendanceType: {
      type: String,
      enum: ['fingerprint', 'manual'],
      default: 'fingerprint',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AttendanceSchema.index({ memberProfileId: 1, date: 1 });
AttendanceSchema.index({ userId: 1, date: 1 });
AttendanceSchema.index({ fingerprintId: 1 });
AttendanceSchema.index({ date: 1 });

export const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>('Attendance', AttendanceSchema);

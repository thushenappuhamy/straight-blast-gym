import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },
    type: {
      type: String,
      enum: ['STRENGTH', 'CARDIO', 'NUTRITION', 'HYPERTROPHY'],
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'IN SESSION', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

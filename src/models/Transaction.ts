import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  memberId: mongoose.Schema.Types.ObjectId;
  memberName: string;
  type: string;
  amount: number;
  paymentMethod: 'PayHere' | 'Card' | 'Cash';
  status: 'COMPLETED' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
  date: Date;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['PayHere', 'Card', 'Cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PROCESSING', 'REFUNDED', 'FAILED'],
      default: 'COMPLETED',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

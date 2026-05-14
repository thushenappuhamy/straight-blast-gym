import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  status: 'unread' | 'read';
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread',
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

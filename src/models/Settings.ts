import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    // Gym Info
    gymName: {
      type: String,
      default: 'Straight Blast Gym',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    openingTime: {
      type: String,
      default: '06:00',
    },
    closingTime: {
      type: String,
      default: '22:00',
    },
    about: {
      type: String,
      default: '',
    },

    // Membership Plans
    basicPrice: {
      type: Number,
      default: 0,
    },
    goldPrice: {
      type: Number,
      default: 0,
    },
    elitePrice: {
      type: Number,
      default: 0,
    },
    goldDiscount: {
      type: Number,
      default: 0,
    },
    eliteDiscount: {
      type: Number,
      default: 0,
    },
    goldSessions: {
      type: Number,
      default: 12,
    },
    allowAnnualBilling: {
      type: Boolean,
      default: false,
    },
    freeTrial: {
      type: Number,
      default: 0, // days
    },

    // Payment Gateway
    paymentProvider: {
      type: String,
      enum: ['payhere', 'stripe', 'other'],
      default: 'payhere',
    },
    merchantId: {
      type: String,
      default: '',
      select: false, // Don't select by default for security
    },
    merchantSecret: {
      type: String,
      default: '',
      select: false, // Don't select by default for security
    },
    liveMode: {
      type: Boolean,
      default: false,
    },
    emailReceipts: {
      type: Boolean,
      default: true,
    },

    // Notifications
    notificationPreferences: {
      newMember: {
        type: Boolean,
        default: true,
      },
      newOrder: {
        type: Boolean,
        default: true,
      },
      trainerBooking: {
        type: Boolean,
        default: true,
      },
      lowStock: {
        type: Boolean,
        default: true,
      },
      membershipExpiry: {
        type: Boolean,
        default: true,
      },
      adminEmail: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

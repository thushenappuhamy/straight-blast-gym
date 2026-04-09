import mongoose from 'mongoose';

const MembershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    tagline: String,
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    features: [String],
    icon: String,
    color: String,
    badge: String,
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    activeMembersCount: {
      type: Number,
      default: 0,
    },
    monthlyRevenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);

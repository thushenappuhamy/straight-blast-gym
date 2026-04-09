const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  tagline: String,
  price: { type: Number, required: true },
  duration: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  features: [String],
  icon: String,
  color: String,
  badge: String,
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  activeMembersCount: { type: Number, default: 0 },
  monthlyRevenue: { type: Number, default: 0 },
}, { timestamps: true });

const Membership = mongoose.model('Membership', membershipSchema);

const defaultPlans = [
  {
    name: 'Student',
    description: 'Perfect for students with budget constraints',
    tagline: 'Budget Friendly',
    price: 3000,
    duration: 'monthly',
    features: [
      'Gym access (weekdays 5-8pm)',
      'Basic workout plan',
      'Access to student community',
      'Monthly group classes'
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Basic',
    description: 'Get started with essential gym features',
    tagline: 'Good Value',
    price: 4000,
    duration: 'monthly',
    features: [
      'Unlimited gym access',
      'Basic workout plans',
      'Supplement shop access',
      'Community support',
      'Monthly fitness tips'
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Standard',
    description: 'Our most popular plan with more features',
    tagline: 'Best Value',
    price: 6500,
    duration: 'monthly',
    features: [
      'Everything in Basic',
      'AI meal plan generator',
      '2 trainer sessions/month',
      'Nutrition consultations',
      'Progress tracking',
      'Supplement 10% discount'
    ],
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Premium',
    description: 'Complete fitness transformation program',
    tagline: 'Premium Experience',
    price: 20000,
    duration: 'monthly',
    features: [
      'Everything in Standard',
      '8 trainer sessions/month',
      'Customized meal plans',
      'Body composition analysis',
      'Monthly fitness assessments',
      '15% supplement discount',
      'Priority trainer scheduling',
      'Exclusive member events'
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Powerlifting',
    description: 'Specialized program for serious lifters',
    tagline: 'Elite Training',
    price: 25000,
    duration: 'monthly',
    features: [
      'Everything in Premium',
      'Unlimited trainer sessions',
      'Specialized powerlifting coaching',
      'Competition preparation',
      'Advanced programming',
      '20% supplement discount',
      '1-on-1 nutrition coaching',
      'Recovery optimization',
      'Exclusive athlete community'
    ],
    isFeatured: false,
    isActive: true,
  },
];

async function seedMemberships() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      throw new Error('MONGODB_URI not set');
    }
    
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Seeding default membership plans...');
    
    // Clear existing default plans (by name)
    const namesToClear = defaultPlans.map(p => p.name);
    const result = await Membership.deleteMany({ name: { $in: namesToClear } });
    console.log(`🗑️ Cleared ${result.deletedCount} existing default plans`);

    // Insert default plans
    const insertedPlans = await Membership.insertMany(defaultPlans);
    console.log(`✅ Successfully added ${insertedPlans.length} membership plans:`);
    
    insertedPlans.forEach(plan => {
      console.log(`   • ${plan.name} - LKR ${plan.price.toLocaleString()} (${plan.duration}) ${plan.isFeatured ? '⭐ Featured' : ''}`);
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedMemberships();

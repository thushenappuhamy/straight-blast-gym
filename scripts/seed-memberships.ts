#!/usr/bin/env node
import mongoose from 'mongoose';
import Membership from '../src/models/Membership';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

const mongoUri = MONGODB_URI as string;

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
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Seeding default membership plans...');
    
    // Clear existing memberships
    await Membership.deleteMany({ name: { $in: defaultPlans.map(p => p.name) } });
    console.log('🗑️ Cleared existing default plans');

    // Insert default plans
    const result = await Membership.insertMany(defaultPlans);
    console.log(`✅ Successfully added ${result.length} membership plans:`);
    
    result.forEach(plan => {
      console.log(`   • ${plan.name} - LKR ${plan.price.toLocaleString()} (${plan.duration})`);
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

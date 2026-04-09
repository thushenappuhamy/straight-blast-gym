const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  membershipStatus: String,
}, { timestamps: true });

const trainerSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  hourlyRate: Number,
  bio: String,
  image: String,
  rating: Number,
  totalSessions: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Trainer = mongoose.model('Trainer', trainerSchema);
const Booking = mongoose.model('Booking', bookingSchema);

async function seedBookings() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      throw new Error('MONGODB_URI not set');
    }
    
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Fetch first member and trainer
    const member = await User.findOne({ role: 'user' }).limit(1);
    const trainer = await Trainer.findOne().limit(1);

    if (!member || !trainer) {
      console.log('⚠️ Need at least one member and one trainer to seed bookings');
      await mongoose.disconnect();
      return;
    }

    console.log('🌱 Seeding sample bookings...');

    // Clear existing bookings
    const deleteResult = await Booking.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing bookings`);

    // Create sample bookings
    const sampleBookings = [
      {
        memberId: member._id,
        trainerId: trainer._id,
        type: 'STRENGTH',
        fee: 3500,
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'UPCOMING',
        notes: 'Full body workout with focus on legs',
      },
      {
        memberId: member._id,
        trainerId: trainer._id,
        type: 'CARDIO',
        fee: 2500,
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'UPCOMING',
        notes: 'HIIT training session',
      },
      {
        memberId: member._id,
        trainerId: trainer._id,
        type: 'NUTRITION',
        fee: 2000,
        dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        status: 'UPCOMING',
        notes: 'Nutrition consultation for weight loss',
      },
      {
        memberId: member._id,
        trainerId: trainer._id,
        type: 'STRENGTH',
        fee: 3500,
        dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'COMPLETED',
        notes: 'Upper body strength training',
      },
      {
        memberId: member._id,
        trainerId: trainer._id,
        type: 'HYPERTROPHY',
        fee: 4000,
        dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        status: 'COMPLETED',
        notes: 'Muscle building program',
      },
    ];

    const insertedBookings = await Booking.insertMany(sampleBookings);
    console.log(`✅ Successfully added ${insertedBookings.length} sample bookings:`);
    
    insertedBookings.forEach(booking => {
      console.log(`   • ${booking.type} - LKR ${booking.fee} (${booking.status})`);
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedBookings();

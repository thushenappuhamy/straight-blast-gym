const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User schema
const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    gender: String,
    dateOfBirth: Date,
    fitnessGoal: [String],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    plan: { type: String, enum: ['basic', 'gold', 'elite'], default: 'basic' },
    membershipStatus: { type: String, enum: ['active', 'pending', 'inactive'], default: 'pending' },
    bmi: Number,
    height: Number,
    weight: Number,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists:', existingAdmin.email);
      process.exit(1);
    }

    // Create admin user
    const adminEmail = 'admin@sbgnegombo.lk';
    const adminPassword = 'Admin@2024'; // Change this in production

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      membershipStatus: 'active',
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

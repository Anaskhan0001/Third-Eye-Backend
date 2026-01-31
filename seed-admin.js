const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'anasmr719@gmail.com',
      password: 'Mr@12345', // Will be hashed by the pre-save hook
      phone: '+91-7860202563',
      role: 'admin',
    });

    await adminUser.save();
    console.log('✓ Admin user created successfully');
    console.log('Admin Email: anasmr719@gmail.com');
    console.log('Admin Password: Mr@12345');
    console.log('\n⚠️ IMPORTANT: Change this password after first login!');

    // Verify admin was created
    const verifyAdmin = await User.findOne({ email: 'admin@thirdeye.com' }).select('+password');
    if (verifyAdmin && verifyAdmin.role === 'admin') {
      console.log('✓ Admin account verified in database');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash('Mr@12345', 10);

    const adminUser = new User({
      name: 'Admin',
      email: 'anasmr719@gmail.com',
      password: hashedPassword,
      phone: '7860202563',
      role: 'admin',
    });

    await adminUser.save();

    console.log('✓ Admin user created');
    console.log('Email: anasmr719@gmail.com');
    console.log('Password: Mr@12345');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedAdmin();

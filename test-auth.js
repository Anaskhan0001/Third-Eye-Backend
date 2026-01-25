#!/usr/bin/env node

/**
 * Quick Test Script for Login/Registration
 * Run: node test-auth.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const test = async () => {
  console.log('\n🧪 Authentication Test\n');
  console.log('═════════════════════════════════════════\n');

  // Test 1: Check environment variables
  console.log('1️⃣  Checking environment variables...');
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set (' + process.env.JWT_SECRET.substring(0, 20) + '...)' : '❌ Missing'}`);
  console.log(`   PORT: ${process.env.PORT || '5000'}\n`);

  try {
    // Test 2: MongoDB Connection
    console.log('2️⃣  Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`   ✅ Connected to: ${conn.connection.host}`);
    console.log(`   ✅ Database: ${conn.connection.db.databaseName}\n`);

    // Test 3: Check if users collection exists
    console.log('3️⃣  Checking users collection...');
    const userCount = await User.countDocuments();
    console.log(`   ✅ Total users in database: ${userCount}\n`);

    // Test 4: Find admin user
    console.log('4️⃣  Looking for admin user...');
    const adminUser = await User.findOne({ role: 'admin' }).select('+password');
    if (adminUser) {
      console.log(`   ✅ Admin found: ${adminUser.email}`);
      console.log(`   ✅ Admin name: ${adminUser.name}`);
      console.log(`   ✅ Password hash exists: ${adminUser.password ? 'Yes' : 'No'}\n`);

      // Test 5: Test password comparison
      console.log('5️⃣  Testing password comparison...');
      const testPassword = 'Admin@123';
      const isPasswordValid = await adminUser.comparePassword(testPassword);
      console.log(`   Password "${testPassword}" is: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}\n`);

      // Test 6: Test JWT token generation
      console.log('6️⃣  Testing JWT token generation...');
      if (process.env.JWT_SECRET) {
        const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log(`   ✅ Token generated successfully`);
        console.log(`   ✅ Token length: ${token.length} characters\n`);
      } else {
        console.log(`   ❌ Cannot generate token - JWT_SECRET not set\n`);
      }
    } else {
      console.log(`   ❌ No admin user found\n`);
      console.log('   📌 Create admin with: npm run seed-admin\n');
    }

    // Test 7: List all users
    console.log('7️⃣  All users in database:');
    const allUsers = await User.find().select('-password');
    if (allUsers.length > 0) {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.name}`);
      });
    } else {
      console.log('   (No users found)');
    }
    console.log();

    console.log('═════════════════════════════════════════');
    console.log('✅ All tests completed!\n');

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    console.error('Stack:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

test();

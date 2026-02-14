const mongoose = require('mongoose');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.log("DB Connection Error:", err.message);
    process.exit(1);
  });

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit();
    }

    const admin = new User({
      name: "Admin",
      email: "admin@thirdeye.com",
      password: "Admin@786!",   // Plain password (schema will hash automatically)
      phone: "7860202563",      // Added phone number
      role: "admin"
    });

    await admin.save();

    console.log("Admin created successfully");
    console.log("Email: admin@thirdeye.com");
    console.log("Password: Admin@786!");
    process.exit();

  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();


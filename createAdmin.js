require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = new User({
      name: "Admin",
      email: "admin@thirdeye.com",
      password: "Admin@786!",
      role: "admin"
    });

    await admin.save();

    console.log("Admin created successfully");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createAdmin();

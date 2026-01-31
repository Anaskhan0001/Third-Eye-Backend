const User = require('../models/User');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    const totalMessages = await ContactMessage.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const unreadMessages = await ContactMessage.countDocuments({ status: 'unread' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        totalMessages,
        pendingBookings,
        unreadMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

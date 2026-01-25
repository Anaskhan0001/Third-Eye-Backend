const User = require('../models/User');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');

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

const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, phone, service, date, time, message } = req.body;

    const booking = new Booking({
      userId: req.userId,
      name,
      email,
      phone,
      service,
      date,
      time,
      message,
      status: 'pending',
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId', 'name email phone').sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'All bookings retrieved successfully',
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    service: {
      type: String,
      required: [true, 'Please select a service'],
      enum: [
        'CCTV Camera Systems',
        'Networking Solutions',
        'Wi-Fi Solutions',
        'IT Systems & Servers',
        'Biometric Systems',
        'Security Systems',
        'Installation Services',
        'Support & Maintenance',
      ],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide a time'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

const express = require('express');
const { body } = require('express-validator');
const { createBooking, getUserBookings, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/create',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('service').notEmpty().withMessage('Service is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
  ],
  handleValidationErrors,
  createBooking
);

router.get('/my-bookings', authMiddleware, getUserBookings);

router.get('/all-bookings', authMiddleware, adminMiddleware, getAllBookings);

router.put(
  '/:bookingId/status',
  authMiddleware,
  adminMiddleware,
  [body('status').notEmpty().withMessage('Status is required')],
  handleValidationErrors,
  updateBookingStatus
);

module.exports = router;

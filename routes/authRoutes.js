const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, adminLogin, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({ 
      success: false, 
      message: firstError.msg 
    });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().optional(),
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  login
);

router.post(
  '/admin/login',
  [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  adminLogin
);

router.put(
  '/profile',
  auth,
  [
    body('name').trim().optional(),
    body('email').isEmail().withMessage('Valid email is required').optional(),
    body('phone').trim().optional(),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters').optional(),
  ],
  handleValidationErrors,
  updateProfile
);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const { createMessage, getAllMessages, updateMessageStatus } = require('../controllers/contactController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/send',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  handleValidationErrors,
  createMessage
);

router.get('/all-messages', authMiddleware, adminMiddleware, getAllMessages);

router.put(
  '/:messageId/status',
  authMiddleware,
  adminMiddleware,
  [body('status').notEmpty().withMessage('Status is required')],
  handleValidationErrors,
  updateMessageStatus
);

module.exports = router;

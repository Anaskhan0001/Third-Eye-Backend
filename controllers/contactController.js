const ContactMessage = require('../models/ContactMessage');
const { validationResult } = require('express-validator');

exports.createMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, message } = req.body;

    const contactMessage = new ContactMessage({
      name,
      email,
      message,
      status: 'unread',
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      contactMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!['unread', 'read'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const message = await ContactMessage.findByIdAndUpdate(messageId, { status }, { new: true });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message status updated',
      contactMessage: message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

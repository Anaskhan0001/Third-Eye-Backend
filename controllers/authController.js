const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
    if (existingEmailUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    // Check if phone already exists
    if (phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser) {
        return res.status(400).json({ success: false, message: 'Phone number already registered. Please login.' });
      }
    }

    // Create new user with lowercase email
    const user = new User({ 
      name, 
      email: email.toLowerCase(), 
      password, 
      phone, 
      role: 'user' 
    });
    await user.save();

    // Verify JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    // Handle MongoDB unique constraint errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
      }
      if (field === 'phone') {
        return res.status(400).json({ success: false, message: 'Phone number already registered. Please login.' });
      }
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages[0] || 'Validation failed' });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password, loginType } = req.body;

    // Validate inputs
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }

    let user = null;

    // Find user by email or phone based on loginType
    if (loginType === 'phone') {
      user = await User.findOne({ phone: identifier }).select('+password');
    } else {
      user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
    }

    // Check if user exists
    if (!user) {
      console.log('Login failed: Account not found -', identifier);
      return res.status(401).json({ success: false, message: 'Account not found. Please register first.' });
    }

    // Check password
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (err) {
      console.error('Password comparison error:', err);
      return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }

    if (!isPasswordValid) {
      console.log('Login failed: Incorrect password for -', identifier);
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    // Verify JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Generate token with expiration
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find admin user from database
    const adminUser = await User.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');
    
    if (!adminUser) {
      console.log('Admin login failed: No admin found with email:', email.toLowerCase());
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // Check password
    const isPasswordValid = await adminUser.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Admin login failed: Invalid password for email:', email.toLowerCase());
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // Generate admin token
    const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: 'admin' },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Admin login failed. Please try again.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { name, email, phone, currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Check if email is being changed - only reject if it belongs to a DIFFERENT user
    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    } else if (email) {
      // Email is the same as current, update it anyway (in case of case changes)
      user.email = email.toLowerCase();
    }

    // Check if phone is being changed - only reject if it belongs to a DIFFERENT user
    if (phone !== undefined && phone !== null) {
      phone = phone.toString().trim();
      if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
          return res.status(400).json({ success: false, message: 'Phone number already in use' });
        }
        user.phone = phone;
      } else if (!phone) {
        // Allow clearing phone number
        user.phone = '';
      } else if (phone === user.phone) {
        // Phone is the same as current, keep it
        user.phone = phone;
      }
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password required to change password' });
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = newPassword;
    }

    // Save updated user
    await user.save();

    // Return updated user (without password)
    const updatedUser = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        role: updatedUser.role || 'user',
      },
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

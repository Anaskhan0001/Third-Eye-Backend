const express = require('express');
const {
  adminLogin,
  getDashboardStats
} = require('../controllers/adminController');

const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ✅ ADMIN LOGIN (PUBLIC)
router.post('/login', adminLogin);

// ✅ ADMIN DASHBOARD (PROTECTED)
router.get(
  '/dashboard/stats',
  authMiddleware,
  adminMiddleware,
  getDashboardStats
);

module.exports = router;

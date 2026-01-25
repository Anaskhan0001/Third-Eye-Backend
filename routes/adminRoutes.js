const express = require('express');
const { getDashboardStats } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard/stats', authMiddleware, adminMiddleware, getDashboardStats);

module.exports = router;

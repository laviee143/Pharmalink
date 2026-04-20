const express = require('express');
const authRoutes = require('./auth/routes/authRoutes');
const userRoutes = require('./users/routes/userRoutes');
const medicineRoutes = require('./medicines/routes/medicineRoutes');
const inventoryRoutes = require('./inventory/routes/inventoryRoutes');
const orderRoutes = require('./orders/routes/orderRoutes');
const paymentRoutes = require('./payments/routes/paymentRoutes');
const messageRoutes = require('./messages/routes/messageRoutes');
const notificationRoutes = require('./notifications/routes/notificationRoutes');
const reportRoutes = require('./reports/routes/reportRoutes');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PharmaLink API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/medicines', medicineRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

module.exports = router;

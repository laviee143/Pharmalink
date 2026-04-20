const express = require('express');
const authRoutes = require('./auth/authRoutes');
const userRoutes = require('./users/userRoutes');
const medicineRoutes = require('./medicines/medicineRoutes');
const inventoryRoutes = require('./inventory/inventoryRoutes');
const orderRoutes = require('./orders/orderRoutes');
const paymentRoutes = require('./payments/paymentRoutes');
const messageRoutes = require('./messages/messageRoutes');
const notificationRoutes = require('./notifications/notificationRoutes');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
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

module.exports = router;

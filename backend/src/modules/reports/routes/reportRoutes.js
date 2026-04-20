const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const reportController = require('../controllers/reportController');

const router = express.Router();

/**
 * @route   GET /api/reports/sales
 * @desc    Get sales report
 * @access  Private
 */
router.get(
  '/sales',
  authenticate(),
  rateLimiter.general,
  reportController.getSalesReport
);

/**
 * @route   GET /api/reports/inventory
 * @desc    Get inventory report
 * @access  Private
 */
router.get(
  '/inventory',
  authenticate(),
  rateLimiter.general,
  reportController.getInventoryReport
);

/**
 * @route   GET /api/reports/financial
 * @desc    Get financial report
 * @access  Private/Admin
 */
router.get(
  '/financial',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.general,
  reportController.getFinancialReport
);

/**
 * @route   GET /api/reports/user-activity
 * @desc    Get user activity report
 * @access  Private/Admin
 */
router.get(
  '/user-activity',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.general,
  reportController.getUserActivityReport
);

/**
 * @route   GET /api/reports/order-analytics
 * @desc    Get order analytics
 * @access  Private
 */
router.get(
  '/order-analytics',
  authenticate(),
  rateLimiter.general,
  reportController.getOrderAnalytics
);

/**
 * @route   GET /api/reports/medicine-performance
 * @desc    Get medicine performance report
 * @access  Private
 */
router.get(
  '/medicine-performance',
  authenticate(),
  rateLimiter.general,
  reportController.getMedicinePerformanceReport
);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get dashboard summary
 * @access  Private
 */
router.get(
  '/dashboard',
  authenticate(),
  rateLimiter.general,
  reportController.getDashboardSummary
);

/**
 * @route   POST /api/reports/export
 * @desc    Export report to CSV
 * @access  Private
 */
router.post(
  '/export',
  authenticate(),
  rateLimiter.general,
  reportController.exportReport
);

module.exports = router;

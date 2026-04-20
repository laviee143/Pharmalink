const express = require('express');
const { validateRequest } = require('../../middlewares/validation');
const { authenticate, authorize } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const notificationController = require('../../controllers/notifications/notificationController');
const { notificationValidationSchemas } = require('../../utils/validators');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications
 * @access  Private
 */
router.get(
  '/',
  authenticate(),
  rateLimiter.general,
  validateRequest(notificationValidationSchemas.getNotifications),
  notificationController.getNotifications
);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(notificationValidationSchemas.getNotificationById),
  notificationController.getNotificationById
);

/**
 * @route   POST /api/notifications
 * @desc    Create notification
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.create,
  validateRequest(notificationValidationSchemas.createNotification),
  notificationController.createNotification
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put(
  '/:id/read',
  authenticate(),
  rateLimiter.update,
  validateRequest(notificationValidationSchemas.markAsRead),
  notificationController.markAsRead
);

/**
 * @route   PUT /api/notifications/mark-read
 * @desc    Mark multiple notifications as read
 * @access  Private
 */
router.put(
  '/mark-read',
  authenticate(),
  rateLimiter.update,
  validateRequest(notificationValidationSchemas.markMultipleAsRead),
  notificationController.markMultipleAsRead
);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put(
  '/mark-all-read',
  authenticate(),
  rateLimiter.update,
  notificationController.markAllAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate(),
  rateLimiter.delete,
  validateRequest(notificationValidationSchemas.deleteNotification),
  notificationController.deleteNotification
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread count
 * @access  Private
 */
router.get(
  '/unread-count',
  authenticate(),
  rateLimiter.general,
  notificationController.getUnreadCount
);

/**
 * @route   GET /api/notifications/types
 * @desc    Get notification types
 * @access  Private
 */
router.get(
  '/types',
  authenticate(),
  rateLimiter.general,
  notificationController.getNotificationTypes
);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get(
  '/preferences',
  authenticate(),
  rateLimiter.general,
  notificationController.getNotificationPreferences
);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authenticate(),
  rateLimiter.update,
  validateRequest(notificationValidationSchemas.updateNotificationPreferences),
  notificationController.updateNotificationPreferences
);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Send bulk notifications
 * @access  Private/Admin
 */
router.post(
  '/bulk',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.create,
  validateRequest(notificationValidationSchemas.sendBulkNotifications),
  notificationController.sendBulkNotifications
);

/**
 * @route   GET /api/notifications/statistics
 * @desc    Get notification statistics
 * @access  Private
 */
router.get(
  '/statistics',
  authenticate(),
  rateLimiter.general,
  validateRequest(notificationValidationSchemas.getNotificationStatistics),
  notificationController.getNotificationStatistics
);

/**
 * @route   POST /api/notifications/test
 * @desc    Test notification
 * @access  Private/Admin
 */
router.post(
  '/test',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.create,
  validateRequest(notificationValidationSchemas.testNotification),
  notificationController.testNotification
);

module.exports = router;

const notificationService = require('../../services/notifications/notificationService');
const { validateRequest } = require('../../middlewares/validation');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    type, 
    unread,
    channels,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const result = await notificationService.getNotifications({
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    unread: unread === 'true',
    channels: channels ? channels.split(',') : undefined,
    sortBy,
    sortOrder,
    userId: req.user.id
  });

  return successResponse(res, result, 'Notifications retrieved successfully');
});

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await notificationService.getNotificationById(id, req.user);

  return successResponse(res, notification, 'Notification retrieved successfully');
});

/**
 * @desc    Create notification
 * @route   POST /api/notifications
 * @access  Private/Admin
 */
const createNotification = asyncHandler(async (req, res) => {
  const notificationData = req.body;

  const notification = await notificationService.createNotification(notificationData);

  return successResponse(res, notification, 'Notification created successfully', 201);
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await notificationService.markAsRead(id, req.user);

  return successResponse(res, null, 'Notification marked as read');
});

/**
 * @desc    Mark multiple notifications as read
 * @route   PUT /api/notifications/mark-read
 * @access  Private
 */
const markMultipleAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  await notificationService.markMultipleAsRead(notificationIds, req.user);

  return successResponse(res, null, 'Notifications marked as read');
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);

  return successResponse(res, null, 'All notifications marked as read');
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await notificationService.deleteNotification(id, req.user);

  return successResponse(res, null, 'Notification deleted successfully');
});

/**
 * @desc    Get unread count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  return successResponse(res, { count }, 'Unread count retrieved successfully');
});

/**
 * @desc    Get notification types
 * @route   GET /api/notifications/types
 * @access  Private
 */
const getNotificationTypes = asyncHandler(async (req, res) => {
  const types = await notificationService.getNotificationTypes();

  return successResponse(res, types, 'Notification types retrieved successfully');
});

/**
 * @desc    Get notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
const getNotificationPreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.getNotificationPreferences(req.user.id);

  return successResponse(res, preferences, 'Notification preferences retrieved successfully');
});

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  const updatedPreferences = await notificationService.updateNotificationPreferences(req.user.id, preferences);

  return successResponse(res, updatedPreferences, 'Notification preferences updated successfully');
});

/**
 * @desc    Send bulk notifications
 * @route   POST /api/notifications/bulk
 * @access  Private/Admin
 */
const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { notifications } = req.body;

  const result = await notificationService.sendBulkNotifications(notifications);

  return successResponse(res, result, 'Bulk notifications sent successfully', 201);
});

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/statistics
 * @access  Private
 */
const getNotificationStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = 'month' } = req.query;

  const statistics = await notificationService.getNotificationStatistics({
    startDate,
    endDate,
    period,
    userId: req.user.id
  });

  return successResponse(res, statistics, 'Notification statistics retrieved successfully');
});

/**
 * @desc    Test notification
 * @route   POST /api/notifications/test
 * @access  Private/Admin
 */
const testNotification = asyncHandler(async (req, res) => {
  const { type, userId, message } = req.body;

  const result = await notificationService.testNotification({
    type,
    userId,
    message,
    sentBy: req.user.id
  });

  return successResponse(res, result, 'Test notification sent successfully');
});

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationTypes,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendBulkNotifications,
  getNotificationStatistics,
  testNotification
};

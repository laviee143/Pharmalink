const express = require('express');
const { validateRequest } = require('../../middlewares/validation');
const { authenticate } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const messageController = require('../../controllers/messages/messageController');
const { messageValidationSchemas } = require('../../utils/validators');

const router = express.Router();

/**
 * @route   GET /api/messages
 * @desc    Get all messages
 * @access  Private
 */
router.get(
  '/',
  authenticate(),
  rateLimiter.general,
  validateRequest(messageValidationSchemas.getMessages),
  messageController.getMessages
);

/**
 * @route   GET /api/messages/:id
 * @desc    Get message by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(messageValidationSchemas.getMessageById),
  messageController.getMessageById
);

/**
 * @route   POST /api/messages
 * @desc    Send message
 * @access  Private
 */
router.post(
  '/',
  authenticate(),
  rateLimiter.message,
  validateRequest(messageValidationSchemas.sendMessage),
  messageController.sendMessage
);

/**
 * @route   POST /api/messages/:id/reply
 * @desc    Reply to message
 * @access  Private
 */
router.post(
  '/:id/reply',
  authenticate(),
  rateLimiter.message,
  validateRequest(messageValidationSchemas.replyToMessage),
  messageController.replyToMessage
);

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put(
  '/:id/read',
  authenticate(),
  rateLimiter.update,
  validateRequest(messageValidationSchemas.markAsRead),
  messageController.markAsRead
);

/**
 * @route   PUT /api/messages/mark-read
 * @desc    Mark multiple messages as read
 * @access  Private
 */
router.put(
  '/mark-read',
  authenticate(),
  rateLimiter.update,
  validateRequest(messageValidationSchemas.markMultipleAsRead),
  messageController.markMultipleAsRead
);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete message
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate(),
  rateLimiter.delete,
  validateRequest(messageValidationSchemas.deleteMessage),
  messageController.deleteMessage
);

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get conversation
 * @access  Private
 */
router.get(
  '/conversation/:userId',
  authenticate(),
  rateLimiter.general,
  validateRequest(messageValidationSchemas.getConversation),
  messageController.getConversation
);

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get unread count
 * @access  Private
 */
router.get(
  '/unread-count',
  authenticate(),
  rateLimiter.general,
  messageController.getUnreadCount
);

/**
 * @route   GET /api/messages/search
 * @desc    Search messages
 * @access  Private
 */
router.get(
  '/search',
  authenticate(),
  rateLimiter.search,
  validateRequest(messageValidationSchemas.searchMessages),
  messageController.searchMessages
);

/**
 * @route   GET /api/messages/:id/attachments
 * @desc    Get message attachments
 * @access  Private
 */
router.get(
  '/:id/attachments',
  authenticate(),
  rateLimiter.general,
  validateRequest(messageValidationSchemas.getMessageAttachments),
  messageController.getMessageAttachments
);

/**
 * @route   GET /api/messages/attachments/:id
 * @desc    Download attachment
 * @access  Private
 */
router.get(
  '/attachments/:id',
  authenticate(),
  rateLimiter.download,
  validateRequest(messageValidationSchemas.downloadAttachment),
  messageController.downloadAttachment
);

/**
 * @route   GET /api/messages/threads
 * @desc    Get message threads
 * @access  Private
 */
router.get(
  '/threads',
  authenticate(),
  rateLimiter.general,
  validateRequest(messageValidationSchemas.getMessageThreads),
  messageController.getMessageThreads
);

module.exports = router;

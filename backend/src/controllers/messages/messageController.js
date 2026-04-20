const messageService = require('../../services/messages/messageService');
const { validateRequest } = require('../../middlewares/validation');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all messages
 * @route   GET /api/messages
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    userId, 
    orderId, 
    unread,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const result = await messageService.getMessages({
    page: parseInt(page),
    limit: parseInt(limit),
    userId,
    orderId,
    unread: unread === 'true',
    sortBy,
    sortOrder,
    currentUserId: req.user.id
  });

  return successResponse(res, result, 'Messages retrieved successfully');
});

/**
 * @desc    Get message by ID
 * @route   GET /api/messages/:id
 * @access  Private
 */
const getMessageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await messageService.getMessageById(id, req.user);

  return successResponse(res, message, 'Message retrieved successfully');
});

/**
 * @desc    Send message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const messageData = {
    ...req.body,
    senderId: req.user.id
  };

  const message = await messageService.sendMessage(messageData);

  return successResponse(res, message, 'Message sent successfully', 201);
});

/**
 * @desc    Reply to message
 * @route   POST /api/messages/:id/reply
 * @access  Private
 */
const replyToMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, attachments } = req.body;

  const message = await messageService.replyToMessage(id, {
    content,
    attachments,
    senderId: req.user.id
  });

  return successResponse(res, message, 'Reply sent successfully', 201);
});

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await messageService.markAsRead(id, req.user);

  return successResponse(res, null, 'Message marked as read');
});

/**
 * @desc    Mark multiple messages as read
 * @route   PUT /api/messages/mark-read
 * @access  Private
 */
const markMultipleAsRead = asyncHandler(async (req, res) => {
  const { messageIds } = req.body;

  await messageService.markMultipleAsRead(messageIds, req.user);

  return successResponse(res, null, 'Messages marked as read');
});

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await messageService.deleteMessage(id, req.user);

  return successResponse(res, null, 'Message deleted successfully');
});

/**
 * @desc    Get conversation
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await messageService.getConversation({
    userId1: req.user.id,
    userId2: userId,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  return successResponse(res, result, 'Conversation retrieved successfully');
});

/**
 * @desc    Get unread count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.getUnreadCount(req.user.id);

  return successResponse(res, { count }, 'Unread count retrieved successfully');
});

/**
 * @desc    Search messages
 * @route   GET /api/messages/search
 * @access  Private
 */
const searchMessages = asyncHandler(async (req, res) => {
  const { 
    q, 
    page = 1, 
    limit = 10,
    userId,
    orderId
  } = req.query;

  const result = await messageService.searchMessages({
    query: q,
    page: parseInt(page),
    limit: parseInt(limit),
    userId,
    orderId,
    currentUserId: req.user.id
  });

  return successResponse(res, result, 'Messages search completed successfully');
});

/**
 * @desc    Get message attachments
 * @route   GET /api/messages/:id/attachments
 * @access  Private
 */
const getMessageAttachments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attachments = await messageService.getMessageAttachments(id, req.user);

  return successResponse(res, attachments, 'Message attachments retrieved successfully');
});

/**
 * @desc    Download attachment
 * @route   GET /api/messages/attachments/:id
 * @access  Private
 */
const downloadAttachment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attachment = await messageService.downloadAttachment(id, req.user);

  if (!attachment) {
    return errorResponse(res, 'Attachment not found', 404);
  }

  res.download(attachment.filePath, attachment.originalName);
});

/**
 * @desc    Get message threads
 * @route   GET /api/messages/threads
 * @access  Private
 */
const getMessageThreads = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await messageService.getMessageThreads({
    userId: req.user.id,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  return successResponse(res, result, 'Message threads retrieved successfully');
});

module.exports = {
  getMessages,
  getMessageById,
  sendMessage,
  replyToMessage,
  markAsRead,
  markMultipleAsRead,
  deleteMessage,
  getConversation,
  getUnreadCount,
  searchMessages,
  getMessageAttachments,
  downloadAttachment,
  getMessageThreads
};

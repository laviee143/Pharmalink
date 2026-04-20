const orderService = require('../../services/orders/orderService');
const { validateRequest } = require('../../middlewares/validation');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    customerId, 
    supplierId,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const result = await orderService.getOrders({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    customerId,
    supplierId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    userId: req.user.id,
    userRole: req.user.role
  });

  return successResponse(res, result, 'Orders retrieved successfully');
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await orderService.getOrderById(id, req.user);

  return successResponse(res, order, 'Order retrieved successfully');
});

/**
 * @desc    Create order
 * @route   POST /api/orders
 * @access  Private/Pharmacy
 */
const createOrder = asyncHandler(async (req, res) => {
  const orderData = {
    ...req.body,
    customerId: req.user.id
  };

  const order = await orderService.createOrder(orderData);

  return successResponse(res, order, 'Order created successfully', 201);
});

/**
 * @desc    Update order
 * @route   PUT /api/orders/:id
 * @access  Private
 */
const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const order = await orderService.updateOrder(id, updateData, req.user);

  return successResponse(res, order, 'Order updated successfully');
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await orderService.cancelOrder(id, reason, req.user);

  return successResponse(res, order, 'Order cancelled successfully');
});

/**
 * @desc    Confirm order
 * @route   PUT /api/orders/:id/confirm
 * @access  Private/Wholesaler
 */
const confirmOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estimatedDeliveryDate } = req.body;

  const order = await orderService.confirmOrder(id, estimatedDeliveryDate, req.user);

  return successResponse(res, order, 'Order confirmed successfully');
});

/**
 * @desc    Ship order
 * @route   PUT /api/orders/:id/ship
 * @access  Private/Wholesaler
 */
const shipOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { trackingNumber, estimatedDeliveryDate } = req.body;

  const order = await orderService.shipOrder(id, trackingNumber, estimatedDeliveryDate, req.user);

  return successResponse(res, order, 'Order shipped successfully');
});

/**
 * @desc    Deliver order
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Wholesaler
 */
const deliverOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deliveryNotes } = req.body;

  const order = await orderService.deliverOrder(id, deliveryNotes, req.user);

  return successResponse(res, order, 'Order delivered successfully');
});

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/statistics
 * @access  Private
 */
const getOrderStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = 'month' } = req.query;

  const statistics = await orderService.getOrderStatistics({
    startDate,
    endDate,
    period,
    userId: req.user.id,
    userRole: req.user.role
  });

  return successResponse(res, statistics, 'Order statistics retrieved successfully');
});

/**
 * @desc    Get order items
 * @route   GET /api/orders/:id/items
 * @access  Private
 */
const getOrderItems = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const items = await orderService.getOrderItems(id, req.user);

  return successResponse(res, items, 'Order items retrieved successfully');
});

/**
 * @desc    Add order item
 * @route   POST /api/orders/:id/items
 * @access  Private/Pharmacy
 */
const addOrderItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const itemData = req.body;

  const item = await orderService.addOrderItem(id, itemData, req.user);

  return successResponse(res, item, 'Order item added successfully', 201);
});

/**
 * @desc    Update order item
 * @route   PUT /api/orders/:id/items/:itemId
 * @access  Private/Wholesaler
 */
const updateOrderItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  const updateData = req.body;

  const item = await orderService.updateOrderItem(id, itemId, updateData, req.user);

  return successResponse(res, item, 'Order item updated successfully');
});

/**
 * @desc    Delete order item
 * @route   DELETE /api/orders/:id/items/:itemId
 * @access  Private/Pharmacy
 */
const deleteOrderItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;

  await orderService.deleteOrderItem(id, itemId, req.user);

  return successResponse(res, null, 'Order item deleted successfully');
});

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  getOrderStatistics,
  getOrderItems,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem
};

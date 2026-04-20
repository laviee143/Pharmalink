const express = require('express');
const { validateRequest } = require('../../middlewares/validation');
const { authenticate, authorize } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const orderController = require('../../controllers/orders/orderController');
const { orderValidationSchemas } = require('../../utils/validators');

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders
 * @access  Private
 */
router.get(
  '/',
  authenticate(),
  rateLimiter.general,
  validateRequest(orderValidationSchemas.getOrders),
  orderController.getOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(orderValidationSchemas.getOrderById),
  orderController.getOrderById
);

/**
 * @route   POST /api/orders
 * @desc    Create order
 * @access  Private/Pharmacy
 */
router.post(
  '/',
  authenticate(),
  authorize('PHARMACY'),
  rateLimiter.create,
  validateRequest(orderValidationSchemas.createOrder),
  orderController.createOrder
);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order
 * @access  Private
 */
router.put(
  '/:id',
  authenticate(),
  rateLimiter.update,
  validateRequest(orderValidationSchemas.updateOrder),
  orderController.updateOrder
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put(
  '/:id/cancel',
  authenticate(),
  rateLimiter.update,
  validateRequest(orderValidationSchemas.cancelOrder),
  orderController.cancelOrder
);

/**
 * @route   PUT /api/orders/:id/confirm
 * @desc    Confirm order
 * @access  Private/Wholesaler
 */
router.put(
  '/:id/confirm',
  authenticate(),
  authorize('WHOLESALER'),
  rateLimiter.update,
  validateRequest(orderValidationSchemas.confirmOrder),
  orderController.confirmOrder
);

/**
 * @route   PUT /api/orders/:id/ship
 * @desc    Ship order
 * @access  Private/Wholesaler
 */
router.put(
  '/:id/ship',
  authenticate(),
  authorize('WHOLESALER'),
  rateLimiter.update,
  validateRequest(orderValidationSchemas.shipOrder),
  orderController.shipOrder
);

/**
 * @route   PUT /api/orders/:id/deliver
 * @desc    Deliver order
 * @access  Private/Wholesaler
 */
router.put(
  '/:id/deliver',
  authenticate(),
  authorize('WHOLESALER'),
  rateLimiter.update,
  validateRequest(orderValidationSchemas.deliverOrder),
  orderController.deliverOrder
);

/**
 * @route   GET /api/orders/statistics
 * @desc    Get order statistics
 * @access  Private
 */
router.get(
  '/statistics',
  authenticate(),
  rateLimiter.general,
  validateRequest(orderValidationSchemas.getOrderStatistics),
  orderController.getOrderStatistics
);

/**
 * @route   GET /api/orders/:id/items
 * @desc    Get order items
 * @access  Private
 */
router.get(
  '/:id/items',
  authenticate(),
  rateLimiter.general,
  validateRequest(orderValidationSchemas.getOrderItems),
  orderController.getOrderItems
);

/**
 * @route   POST /api/orders/:id/items
 * @desc    Add order item
 * @access  Private/Pharmacy
 */
router.post(
  '/:id/items',
  authenticate(),
  authorize('PHARMACY'),
  rateLimiter.create,
  validateRequest(orderValidationSchemas.addOrderItem),
  orderController.addOrderItem
);

/**
 * @route   PUT /api/orders/:id/items/:itemId
 * @desc    Update order item
 * @access  Private/Wholesaler
 */
router.put(
  '/:id/items/:itemId',
  authenticate(),
  authorize('WHOLESALER'),
  rateLimiter.update,
  validateRequest(orderValidationSchemas.updateOrderItem),
  orderController.updateOrderItem
);

/**
 * @route   DELETE /api/orders/:id/items/:itemId
 * @desc    Delete order item
 * @access  Private/Pharmacy
 */
router.delete(
  '/:id/items/:itemId',
  authenticate(),
  authorize('PHARMACY'),
  rateLimiter.delete,
  validateRequest(orderValidationSchemas.deleteOrderItem),
  orderController.deleteOrderItem
);

module.exports = router;

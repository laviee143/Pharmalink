const express = require('express');
const { validateRequest } = require('../../middlewares/validation');
const { authenticate } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const inventoryController = require('../../controllers/inventory/inventoryController');
const { inventoryValidationSchemas } = require('../../utils/validators');

const router = express.Router();

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items
 * @access  Private
 */
router.get(
  '/',
  authenticate(),
  rateLimiter.general,
  validateRequest(inventoryValidationSchemas.getInventory),
  inventoryController.getInventory
);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get inventory item by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(inventoryValidationSchemas.getInventoryById),
  inventoryController.getInventoryById
);

/**
 * @route   POST /api/inventory
 * @desc    Add inventory item
 * @access  Private
 */
router.post(
  '/',
  authenticate(),
  rateLimiter.create,
  validateRequest(inventoryValidationSchemas.addInventoryItem),
  inventoryController.addInventoryItem
);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update inventory item
 * @access  Private
 */
router.put(
  '/:id',
  authenticate(),
  rateLimiter.update,
  validateRequest(inventoryValidationSchemas.updateInventoryItem),
  inventoryController.updateInventoryItem
);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete inventory item
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate(),
  rateLimiter.delete,
  validateRequest(inventoryValidationSchemas.deleteInventoryItem),
  inventoryController.deleteInventoryItem
);

/**
 * @route   PUT /api/inventory/:id/adjust
 * @desc    Adjust inventory stock
 * @access  Private
 */
router.put(
  '/:id/adjust',
  authenticate(),
  rateLimiter.update,
  validateRequest(inventoryValidationSchemas.adjustInventoryStock),
  inventoryController.adjustInventoryStock
);

/**
 * @route   GET /api/inventory/low-stock-alerts
 * @desc    Get low stock alerts
 * @access  Private
 */
router.get(
  '/low-stock-alerts',
  authenticate(),
  rateLimiter.general,
  inventoryController.getLowStockAlerts
);

/**
 * @route   GET /api/inventory/expiring-items
 * @desc    Get expiring items
 * @access  Private
 */
router.get(
  '/expiring-items',
  authenticate(),
  rateLimiter.general,
  validateRequest(inventoryValidationSchemas.getExpiringItems),
  inventoryController.getExpiringItems
);

/**
 * @route   GET /api/inventory/summary
 * @desc    Get inventory summary
 * @access  Private
 */
router.get(
  '/summary',
  authenticate(),
  rateLimiter.general,
  inventoryController.getInventorySummary
);

/**
 * @route   PUT /api/inventory/bulk-update
 * @desc    Bulk update inventory
 * @access  Private
 */
router.put(
  '/bulk-update',
  authenticate(),
  rateLimiter.update,
  validateRequest(inventoryValidationSchemas.bulkUpdateInventory),
  inventoryController.bulkUpdateInventory
);

module.exports = router;

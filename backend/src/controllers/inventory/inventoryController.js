const inventoryService = require('../../services/inventory/inventoryService');
const { validateRequest } = require('../../middlewares/validation');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
const getInventory = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    medicineId, 
    lowStock, 
    expiringSoon,
    location,
    userId = req.user.id 
  } = req.query;

  const result = await inventoryService.getInventory({
    page: parseInt(page),
    limit: parseInt(limit),
    medicineId,
    userId,
    lowStock: lowStock === 'true',
    expiringSoon: expiringSoon === 'true',
    location
  });

  return successResponse(res, result, 'Inventory retrieved successfully');
});

/**
 * @desc    Get inventory item by ID
 * @route   GET /api/inventory/:id
 * @access  Private
 */
const getInventoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inventory = await inventoryService.getInventoryById(id, req.user);

  return successResponse(res, inventory, 'Inventory item retrieved successfully');
});

/**
 * @desc    Add inventory item
 * @route   POST /api/inventory
 * @access  Private
 */
const addInventoryItem = asyncHandler(async (req, res) => {
  const inventoryData = {
    ...req.body,
    userId: req.user.id
  };

  const inventory = await inventoryService.addInventoryItem(inventoryData);

  return successResponse(res, inventory, 'Inventory item added successfully', 201);
});

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private
 */
const updateInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const inventory = await inventoryService.updateInventoryItem(id, updateData, req.user);

  return successResponse(res, inventory, 'Inventory item updated successfully');
});

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private
 */
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await inventoryService.deleteInventoryItem(id, req.user);

  return successResponse(res, null, 'Inventory item deleted successfully');
});

/**
 * @desc    Adjust inventory stock
 * @route   PUT /api/inventory/:id/adjust
 * @access  Private
 */
const adjustInventoryStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, reason } = req.body;

  const inventory = await inventoryService.adjustStock(id, quantity, reason, req.user);

  return successResponse(res, inventory, 'Inventory stock adjusted successfully');
});

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/low-stock-alerts
 * @access  Private
 */
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const alerts = await inventoryService.getLowStockAlerts(userId);

  return successResponse(res, alerts, 'Low stock alerts retrieved successfully');
});

/**
 * @desc    Get expiring items
 * @route   GET /api/inventory/expiring-items
 * @access  Private
 */
const getExpiringItems = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;

  const items = await inventoryService.getExpiringItems(userId, parseInt(days));

  return successResponse(res, items, 'Expiring items retrieved successfully');
});

/**
 * @desc    Get inventory summary
 * @route   GET /api/inventory/summary
 * @access  Private
 */
const getInventorySummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const summary = await inventoryService.getInventorySummary(userId);

  return successResponse(res, summary, 'Inventory summary retrieved successfully');
});

/**
 * @desc    Bulk update inventory
 * @route   PUT /api/inventory/bulk-update
 * @access  Private
 */
const bulkUpdateInventory = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  const result = await inventoryService.bulkUpdateInventory(items, userId);

  return successResponse(res, result, 'Inventory bulk updated successfully');
});

module.exports = {
  getInventory,
  getInventoryById,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryStock,
  getLowStockAlerts,
  getExpiringItems,
  getInventorySummary,
  bulkUpdateInventory
};

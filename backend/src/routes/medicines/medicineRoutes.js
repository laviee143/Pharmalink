const express = require('express');
const { validateRequest } = require('../../middlewares/validation');
const { authenticate, authorize } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const medicineController = require('../../controllers/medicines/medicineController');
const { medicineValidationSchemas } = require('../../utils/validators');

const router = express.Router();

/**
 * @route   GET /api/medicines
 * @desc    Get all medicines
 * @access  Private
 */
router.get(
  '/',
  authenticate(),
  rateLimiter.general,
  validateRequest(medicineValidationSchemas.getMedicines),
  medicineController.getMedicines
);

/**
 * @route   GET /api/medicines/:id
 * @desc    Get medicine by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(medicineValidationSchemas.getMedicineById),
  medicineController.getMedicineById
);

/**
 * @route   POST /api/medicines
 * @desc    Create medicine
 * @access  Private/Wholesaler/Admin
 */
router.post(
  '/',
  authenticate(),
  authorize('WHOLESALER', 'ADMIN'),
  rateLimiter.create,
  validateRequest(medicineValidationSchemas.createMedicine),
  medicineController.createMedicine
);

/**
 * @route   PUT /api/medicines/:id
 * @desc    Update medicine
 * @access  Private/Wholesaler/Admin
 */
router.put(
  '/:id',
  authenticate(),
  authorize('WHOLESALER', 'ADMIN'),
  rateLimiter.update,
  validateRequest(medicineValidationSchemas.updateMedicine),
  medicineController.updateMedicine
);

/**
 * @route   DELETE /api/medicines/:id
 * @desc    Delete medicine
 * @access  Private/Wholesaler/Admin
 */
router.delete(
  '/:id',
  authenticate(),
  authorize('WHOLESALER', 'ADMIN'),
  rateLimiter.delete,
  validateRequest(medicineValidationSchemas.deleteMedicine),
  medicineController.deleteMedicine
);

/**
 * @route   GET /api/medicines/low-stock
 * @desc    Get low stock medicines
 * @access  Private
 */
router.get(
  '/low-stock',
  authenticate(),
  rateLimiter.general,
  medicineController.getLowStockMedicines
);

/**
 * @route   GET /api/medicines/expiring
 * @desc    Get expiring medicines
 * @access  Private
 */
router.get(
  '/expiring',
  authenticate(),
  rateLimiter.general,
  validateRequest(medicineValidationSchemas.getExpiringMedicines),
  medicineController.getExpiringMedicines
);

/**
 * @route   GET /api/medicines/categories
 * @desc    Get medicine categories
 * @access  Private
 */
router.get(
  '/categories',
  authenticate(),
  rateLimiter.general,
  medicineController.getMedicineCategories
);

/**
 * @route   GET /api/medicines/search
 * @desc    Search medicines
 * @access  Private
 */
router.get(
  '/search',
  authenticate(),
  rateLimiter.search,
  validateRequest(medicineValidationSchemas.searchMedicines),
  medicineController.searchMedicines
);

module.exports = router;

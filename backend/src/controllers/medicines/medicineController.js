const medicineService = require('../../services/medicines/medicineService');
const { validateRequest } = require('../../middlewares/validation');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all medicines
 * @route   GET /api/medicines
 * @access  Private
 */
const getMedicines = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    category, 
    form, 
    requiresPrescription,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const result = await medicineService.getMedicines({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    category,
    form,
    requiresPrescription: requiresPrescription === 'true',
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    sortBy,
    sortOrder
  });

  return successResponse(res, result, 'Medicines retrieved successfully');
});

/**
 * @desc    Get medicine by ID
 * @route   GET /api/medicines/:id
 * @access  Private
 */
const getMedicineById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const medicine = await medicineService.getMedicineById(id);

  return successResponse(res, medicine, 'Medicine retrieved successfully');
});

/**
 * @desc    Create medicine
 * @route   POST /api/medicines
 * @access  Private/Wholesaler/Admin
 */
const createMedicine = asyncHandler(async (req, res) => {
  const medicineData = req.body;
  const createdBy = req.user.id;

  const medicine = await medicineService.createMedicine(medicineData, createdBy);

  return successResponse(res, medicine, 'Medicine created successfully', 201);
});

/**
 * @desc    Update medicine
 * @route   PUT /api/medicines/:id
 * @access  Private/Wholesaler/Admin
 */
const updateMedicine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedBy = req.user.id;

  const medicine = await medicineService.updateMedicine(id, updateData, updatedBy);

  return successResponse(res, medicine, 'Medicine updated successfully');
});

/**
 * @desc    Delete medicine
 * @route   DELETE /api/medicines/:id
 * @access  Private/Wholesaler/Admin
 */
const deleteMedicine = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await medicineService.deleteMedicine(id);

  return successResponse(res, null, 'Medicine deleted successfully');
});

/**
 * @desc    Get low stock medicines
 * @route   GET /api/medicines/low-stock
 * @access  Private
 */
const getLowStockMedicines = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const medicines = await medicineService.getLowStockMedicines(userId);

  return successResponse(res, medicines, 'Low stock medicines retrieved successfully');
});

/**
 * @desc    Get expiring medicines
 * @route   GET /api/medicines/expiring
 * @access  Private
 */
const getExpiringMedicines = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;

  const medicines = await medicineService.getExpiringMedicines(userId, parseInt(days));

  return successResponse(res, medicines, 'Expiring medicines retrieved successfully');
});

/**
 * @desc    Get medicine categories
 * @route   GET /api/medicines/categories
 * @access  Private
 */
const getMedicineCategories = asyncHandler(async (req, res) => {
  const categories = await medicineService.getMedicineCategories();

  return successResponse(res, categories, 'Medicine categories retrieved successfully');
});

/**
 * @desc    Search medicines
 * @route   GET /api/medicines/search
 * @access  Private
 */
const searchMedicines = asyncHandler(async (req, res) => {
  const { 
    q, 
    page = 1, 
    limit = 10,
    category,
    form,
    minPrice,
    maxPrice
  } = req.query;

  const result = await medicineService.searchMedicines({
    query: q,
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    form,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
  });

  return successResponse(res, result, 'Medicines search completed successfully');
});

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockMedicines,
  getExpiringMedicines,
  getMedicineCategories,
  searchMedicines
};

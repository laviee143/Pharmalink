const paymentService = require('../../services/payments/paymentService');
const { validateRequest } = require('../../middlewares/validation');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private
 */
const getPayments = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    method, 
    orderId,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const result = await paymentService.getPayments({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    method,
    orderId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    userId: req.user.id,
    userRole: req.user.role
  });

  return successResponse(res, result, 'Payments retrieved successfully');
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await paymentService.getPaymentById(id, req.user);

  return successResponse(res, payment, 'Payment retrieved successfully');
});

/**
 * @desc    Create payment
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = asyncHandler(async (req, res) => {
  const paymentData = {
    ...req.body,
    userId: req.user.id
  };

  const payment = await paymentService.createPayment(paymentData);

  return successResponse(res, payment, 'Payment created successfully', 201);
});

/**
 * @desc    Update payment
 * @route   PUT /api/payments/:id
 * @access  Private/Admin
 */
const updatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const payment = await paymentService.updatePayment(id, updateData);

  return successResponse(res, payment, 'Payment updated successfully');
});

/**
 * @desc    Process payment
 * @route   POST /api/payments/process
 * @access  Private
 */
const processPayment = asyncHandler(async (req, res) => {
  const { orderId, method, amount, currency = 'USD' } = req.body;

  const payment = await paymentService.processPayment({
    orderId,
    method,
    amount,
    currency,
    userId: req.user.id
  });

  return successResponse(res, payment, 'Payment processed successfully', 201);
});

/**
 * @desc    Verify payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, gatewayResponse } = req.body;

  const payment = await paymentService.verifyPayment(paymentId, gatewayResponse, req.user);

  return successResponse(res, payment, 'Payment verified successfully');
});

/**
 * @desc    Refund payment
 * @route   POST /api/payments/:id/refund
 * @access  Private/Admin
 */
const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const refund = await paymentService.refundPayment(id, amount, reason, req.user);

  return successResponse(res, refund, 'Payment refunded successfully');
});

/**
 * @desc    Get payment methods
 * @route   GET /api/payments/methods
 * @access  Private
 */
const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await paymentService.getPaymentMethods();

  return successResponse(res, methods, 'Payment methods retrieved successfully');
});

/**
 * @desc    Get payment statistics
 * @route   GET /api/payments/statistics
 * @access  Private
 */
const getPaymentStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = 'month' } = req.query;

  const statistics = await paymentService.getPaymentStatistics({
    startDate,
    endDate,
    period,
    userId: req.user.id,
    userRole: req.user.role
  });

  return successResponse(res, statistics, 'Payment statistics retrieved successfully');
});

/**
 * @desc    Get payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    startDate,
    endDate,
    orderId 
  } = req.query;

  const result = await paymentService.getPaymentHistory({
    page: parseInt(page),
    limit: parseInt(limit),
    startDate,
    endDate,
    orderId,
    userId: req.user.id
  });

  return successResponse(res, result, 'Payment history retrieved successfully');
});

/**
 * @desc    Create invoice
 * @route   POST /api/payments/invoice
 * @access  Private
 */
const createInvoice = asyncHandler(async (req, res) => {
  const { orderId, items, notes } = req.body;

  const invoice = await paymentService.createInvoice({
    orderId,
    items,
    notes,
    userId: req.user.id
  });

  return successResponse(res, invoice, 'Invoice created successfully', 201);
});

/**
 * @desc    Get invoice by ID
 * @route   GET /api/payments/invoice/:id
 * @access  Private
 */
const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await paymentService.getInvoiceById(id, req.user);

  return successResponse(res, invoice, 'Invoice retrieved successfully');
});

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  processPayment,
  verifyPayment,
  refundPayment,
  getPaymentMethods,
  getPaymentStatistics,
  getPaymentHistory,
  createInvoice,
  getInvoiceById
};

const express = require('express');
const { validateRequest } = require('../../middlewares/validation');
const { authenticate, authorize } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const paymentController = require('../../controllers/payments/paymentController');
const { paymentValidationSchemas } = require('../../utils/validators');

const router = express.Router();

/**
 * @route   GET /api/payments
 * @desc    Get all payments
 * @access  Private
 */
router.get(
  '/',
  authenticate(),
  rateLimiter.general,
  validateRequest(paymentValidationSchemas.getPayments),
  paymentController.getPayments
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(paymentValidationSchemas.getPaymentById),
  paymentController.getPaymentById
);

/**
 * @route   POST /api/payments
 * @desc    Create payment
 * @access  Private
 */
router.post(
  '/',
  authenticate(),
  rateLimiter.create,
  validateRequest(paymentValidationSchemas.createPayment),
  paymentController.createPayment
);

/**
 * @route   PUT /api/payments/:id
 * @desc    Update payment
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.update,
  validateRequest(paymentValidationSchemas.updatePayment),
  paymentController.updatePayment
);

/**
 * @route   POST /api/payments/process
 * @desc    Process payment
 * @access  Private
 */
router.post(
  '/process',
  authenticate(),
  rateLimiter.payment,
  validateRequest(paymentValidationSchemas.processPayment),
  paymentController.processPayment
);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment
 * @access  Private
 */
router.post(
  '/verify',
  authenticate(),
  rateLimiter.payment,
  validateRequest(paymentValidationSchemas.verifyPayment),
  paymentController.verifyPayment
);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Refund payment
 * @access  Private/Admin
 */
router.post(
  '/:id/refund',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.update,
  validateRequest(paymentValidationSchemas.refundPayment),
  paymentController.refundPayment
);

/**
 * @route   GET /api/payments/methods
 * @desc    Get payment methods
 * @access  Private
 */
router.get(
  '/methods',
  authenticate(),
  rateLimiter.general,
  paymentController.getPaymentMethods
);

/**
 * @route   GET /api/payments/statistics
 * @desc    Get payment statistics
 * @access  Private
 */
router.get(
  '/statistics',
  authenticate(),
  rateLimiter.general,
  validateRequest(paymentValidationSchemas.getPaymentStatistics),
  paymentController.getPaymentStatistics
);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history
 * @access  Private
 */
router.get(
  '/history',
  authenticate(),
  rateLimiter.general,
  validateRequest(paymentValidationSchemas.getPaymentHistory),
  paymentController.getPaymentHistory
);

/**
 * @route   POST /api/payments/invoice
 * @desc    Create invoice
 * @access  Private
 */
router.post(
  '/invoice',
  authenticate(),
  rateLimiter.create,
  validateRequest(paymentValidationSchemas.createInvoice),
  paymentController.createInvoice
);

/**
 * @route   GET /api/payments/invoice/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get(
  '/invoice/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(paymentValidationSchemas.getInvoiceById),
  paymentController.getInvoiceById
);

module.exports = router;

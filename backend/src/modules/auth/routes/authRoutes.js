const express = require('express');
const { validateRequest } = require('../validators/authValidators');
const { rateLimiter } = require('../../middlewares/rateLimit');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  rateLimiter.auth,
  validateRequest('register'),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  rateLimiter.auth,
  validateRequest('login'),
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  rateLimiter.auth,
  validateRequest('refreshToken'),
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  rateLimiter.auth,
  validateRequest('logout'),
  authController.logout
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  rateLimiter.passwordReset,
  validateRequest('forgotPassword'),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post(
  '/reset-password',
  rateLimiter.passwordReset,
  validateRequest('resetPassword'),
  authController.resetPassword
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email
 * @access  Public
 */
router.post(
  '/verify-email',
  rateLimiter.emailVerification,
  validateRequest('verifyEmail'),
  authController.verifyEmail
);

module.exports = router;

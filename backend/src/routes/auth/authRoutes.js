const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../../controllers/auth/authController');

// Import middleware
const { validateRequest } = require('../../middlewares/validation');
const { rateLimiter } = require('../../middlewares/rateLimit');
const { auth } = require('../../middlewares/auth');

// Import validation schemas
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
} = require('../../utils/validationSchemas');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  rateLimiter.auth,
  validateRequest(registerSchema),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  rateLimiter.auth,
  validateRequest(loginSchema),
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  rateLimiter.auth,
  validateRequest(refreshTokenSchema),
  refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  auth,
  validateRequest(refreshTokenSchema),
  logout
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send forgot password email
 * @access  Public
 */
router.post('/forgot-password',
  rateLimiter.auth,
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password',
  rateLimiter.auth,
  validateRequest(resetPasswordSchema),
  resetPassword
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email
 * @access  Public
 */
router.post('/verify-email',
  rateLimiter.auth,
  validateRequest(verifyEmailSchema),
  verifyEmail
);

module.exports = router;

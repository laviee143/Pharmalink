const express = require('express');
const { validateRequest } = require('../../middlewares/validation');
const { authenticate, authorize } = require('../../middlewares/auth');
const { rateLimiter } = require('../../middlewares/rateLimit');
const userController = require('../../controllers/users/userController');
const { userValidationSchemas } = require('../../utils/validators');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get(
  '/',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.general,
  userController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate(),
  rateLimiter.general,
  validateRequest(userValidationSchemas.getUserById),
  userController.getUserById
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate(),
  rateLimiter.general,
  validateRequest(userValidationSchemas.updateProfile),
  userController.updateProfile
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.general,
  validateRequest(userValidationSchemas.updateUser),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.general,
  validateRequest(userValidationSchemas.deleteUser),
  userController.deleteUser
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/change-password',
  authenticate(),
  rateLimiter.passwordChange,
  validateRequest(userValidationSchemas.changePassword),
  userController.changePassword
);

/**
 * @route   PUT /api/users/:id/deactivate
 * @desc    Deactivate user (Admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id/deactivate',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.general,
  validateRequest(userValidationSchemas.deactivateUser),
  userController.deactivateUser
);

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate user (Admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id/activate',
  authenticate(),
  authorize('ADMIN'),
  rateLimiter.general,
  validateRequest(userValidationSchemas.activateUser),
  userController.activateUser
);

module.exports = router;

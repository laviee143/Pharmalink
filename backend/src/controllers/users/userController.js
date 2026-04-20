const userService = require('../../services/users/userService');
const { validateRequest } = require('../../middlewares/validation');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;

  const result = await userService.getUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
  });

  return successResponse(res, result, 'Users retrieved successfully');
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getUserById(id, req.user);

  return successResponse(res, user, 'User retrieved successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  const user = await userService.updateProfile(userId, updateData);

  return successResponse(res, user, 'Profile updated successfully');
});

/**
 * @desc    Update user by ID
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const user = await userService.updateUser(id, updateData);

  return successResponse(res, user, 'User updated successfully');
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.deleteUser(id);

  return successResponse(res, null, 'User deleted successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(userId, currentPassword, newPassword);

  return successResponse(res, null, 'Password changed successfully');
});

/**
 * @desc    Deactivate user
 * @route   PUT /api/users/:id/deactivate
 * @access  Private/Admin
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.deactivateUser(id);

  return successResponse(res, null, 'User deactivated successfully');
});

/**
 * @desc    Activate user
 * @route   PUT /api/users/:id/activate
 * @access  Private/Admin
 */
const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.activateUser(id);

  return successResponse(res, null, 'User activated successfully');
});

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser,
  changePassword,
  deactivateUser,
  activateUser
};

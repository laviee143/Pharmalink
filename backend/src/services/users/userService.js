const { prisma } = require('../../config/database');
const bcrypt = require('bcryptjs');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');

class UserService {
  /**
   * Get all users with pagination and filtering
   */
  async getUsers(filters = {}) {
    const { page = 1, limit = 10, search, role, isActive } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          address: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id, requestingUser) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check permissions - users can only view their own profile, admins can view all
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== id) {
      throw new AppError('Access denied', 403);
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const { password, ...profileData } = updateData;

    // Hash password if provided
    if (password) {
      profileData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: profileData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        isEmailVerified: true,
        isActive: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Update user (admin only)
   */
  async updateUser(id, updateData) {
    const { password, ...userData } = updateData;

    // Hash password if provided
    if (password) {
      userData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        isEmailVerified: true,
        isActive: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id) {
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Activate user
   */
  async activateUser(id) {
    await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    const [
      totalOrders,
      totalPayments,
      unreadMessages,
      unreadNotifications
    ] = await Promise.all([
      prisma.order.count({
        where: { customerId: userId }
      }),
      prisma.payment.count({
        where: { userId }
      }),
      prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })
    ]);

    return {
      totalOrders,
      totalPayments,
      unreadMessages,
      unreadNotifications
    };
  }

  /**
   * Search users
   */
  async searchUsers(query, filters = {}) {
    const { page = 1, limit = 10, role } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true
      }
    });
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  /**
   * Update last logout
   */
  async updateLastLogout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogoutAt: new Date() }
    });
  }
}

module.exports = new UserService();

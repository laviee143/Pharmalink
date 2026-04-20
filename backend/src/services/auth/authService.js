const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../../../config/database');
const { sendEmail } = require('../../utils/email');
const { createTokens } = require('../../utils/jwt');
const { AppError } = require('../../utils/errors');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User data with tokens
   */
  async register(userData) {
    const { email, password, firstName, lastName, role, phone, address } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'PHARMACY',
        phone,
        address,
        emailVerificationToken: crypto.randomBytes(32).toString('hex'),
        isEmailVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    // Send verification email
    await this.sendVerificationEmail(user.email, user.emailVerificationToken);

    // Generate tokens
    const tokens = createTokens(user);

    return {
      user,
      ...tokens
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User data with tokens
   */
  async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = createTokens(user);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isEmailVerified: user.isEmailVerified
      },
      ...tokens
    };
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          address: true,
          isEmailVerified: true
        }
      });

      if (!user) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokens = createTokens(user);
      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Logout user
   * @param {string} refreshToken - Refresh token
   * @param {string} userId - User ID
   */
  async logout(refreshToken, userId) {
    // In a real implementation, you would blacklist the token
    // For now, we'll just update the user's last logout time
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogoutAt: new Date() }
    });
  }

  /**
   * Send forgot password email
   * @param {string} email - User email
   */
  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal that user doesn't exist
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry
      }
    });

    await this.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Object} Updated user
   */
  async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true
      }
    });

    return updatedUser;
  }

  /**
   * Verify email
   * @param {string} token - Verification token
   * @returns {Object} Updated user
   */
  async verifyEmail(token) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        isEmailVerified: false
      }
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        isEmailVerified: true
      }
    });

    return updatedUser;
  }

  /**
   * Send verification email
   * @param {string} email - User email
   * @param {string} token - Verification token
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - PharmaLink',
      template: 'email-verification',
      data: {
        verificationUrl,
        appName: 'PharmaLink'
      }
    });
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} token - Reset token
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - PharmaLink',
      template: 'password-reset',
      data: {
        resetUrl,
        appName: 'PharmaLink'
      }
    });
  }
}

module.exports = new AuthService();

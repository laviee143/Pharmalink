const { prisma } = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AppError } = require('../../utils/errors');
const emailConfig = require('../../config/email');
const redisConfig = require('../../config/redis');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { email, password, firstName, lastName, role = 'PHARMACY', phone, address } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
        address
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
        isActive: true,
        createdAt: true
      }
    });

    // Generate email verification token
    const verificationToken = this.generateToken();
    await redisConfig.set(`email_verification:${verificationToken}`, user.id, 24 * 60 * 60); // 24 hours

    // Send verification email
    await emailConfig.sendEmailVerificationEmail(user, verificationToken);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user,
      ...tokens
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      },
      ...tokens
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Check if refresh token is valid
      const storedToken = await redisConfig.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken, userId) {
    // Remove refresh token from Redis
    await redisConfig.del(`refresh_token:${userId}`);
    
    // Add refresh token to blacklist
    try {
      const decoded = jwt.decode(refreshToken);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisConfig.set(`blacklist_token:${refreshToken}`, 'true', ttl);
      }
    } catch (error) {
      // Ignore token decode errors during logout
    }

    // Update last logout
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogoutAt: new Date() }
    });
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = this.generateToken();
    await redisConfig.set(`password_reset:${resetToken}`, user.id, 60 * 60); // 1 hour

    // Send reset email
    await emailConfig.sendPasswordResetEmail(user, resetToken);
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    // Verify token
    const userId = await redisConfig.get(`password_reset:${token}`);
    if (!userId) {
      throw new AppError('Invalid or expired token', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Remove reset token
    await redisConfig.del(`password_reset:${token}`);

    // Invalidate all refresh tokens for this user
    await redisConfig.del(`refresh_token:${userId}`);

    return { message: 'Password reset successful' };
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    // Verify token
    const userId = await redisConfig.get(`email_verification:${token}`);
    if (!userId) {
      throw new AppError('Invalid or expired token', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update email verification status
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });

    // Remove verification token
    await redisConfig.del(`email_verification:${token}`);

    return { message: 'Email verified successfully' };
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Store refresh token in Redis
    redisConfig.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

    return { accessToken, refreshToken };
  }

  /**
   * Generate random token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate token
   */
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is blacklisted
      const isBlacklisted = await redisConfig.exists(`blacklist_token:${token}`);
      if (isBlacklisted) {
        throw new AppError('Token is blacklisted', 401);
      }

      return decoded;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    return user;
  }
}

module.exports = new AuthService();

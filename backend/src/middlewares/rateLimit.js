const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../utils/constants');

/**
 * Rate limiting middleware configurations
 * Different rate limits for different endpoints
 */

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: RATE_LIMITS.GENERAL.windowMs / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: RATE_LIMITS.AUTH.windowMs / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.windowMs,
  max: RATE_LIMITS.UPLOAD.max,
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.',
    retryAfter: RATE_LIMITS.UPLOAD.windowMs / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification rate limiter
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    success: false,
    message: 'Too many email verification attempts, please try again later.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation rate limiter
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 orders per 15 minutes
  message: {
    success: false,
    message: 'Too many order creation attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user ID if authenticated, otherwise per IP
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
  },
});

// Message sending rate limiter
const messageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 messages per 5 minutes
  message: {
    success: false,
    message: 'Too many messages sent, please try again later.',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
  },
});

// Search rate limiter
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: 'Too many search requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// API documentation rate limiter
const apiDocsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many API documentation requests, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export all rate limiters
module.exports = {
  general: generalLimiter,
  auth: authLimiter,
  upload: uploadLimiter,
  passwordReset: passwordResetLimiter,
  emailVerification: emailVerificationLimiter,
  orderCreation: orderCreationLimiter,
  message: messageLimiter,
  search: searchLimiter,
  apiDocs: apiDocsLimiter
};

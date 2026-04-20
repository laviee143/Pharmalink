const { globalErrorHandler } = require('../utils/errors');
const { errorResponse } = require('../utils/response');

/**
 * Error handling middleware
 * Centralized error handling for the application
 */

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Global error handler
 */
const errorHandler = globalErrorHandler;

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return errorResponse(res, 'Validation failed', 400, errors);
  }
  
  next(err);
};

/**
 * Prisma error handler
 */
const prismaErrorHandler = (err, req, res, next) => {
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'field';
    return errorResponse(res, `Duplicate ${field}. Please use a different value.`, 409);
  }
  
  if (err.code === 'P2025') {
    // Record not found
    return errorResponse(res, 'Record not found', 404);
  }
  
  if (err.code === 'P2003') {
    // Foreign key constraint violation
    return errorResponse(res, 'Invalid reference. Related record not found.', 400);
  }
  
  if (err.code === 'P2014') {
    // Foreign key constraint violation
    return errorResponse(res, 'Cannot delete or update record due to existing references.', 400);
  }
  
  next(err);
};

/**
 * JWT error handler
 */
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }
  
  if (err.name === 'NotBeforeError') {
    return errorResponse(res, 'Token not active', 401);
  }
  
  next(err);
};

/**
 * Multer error handler
 */
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File too large', 400);
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, 'Too many files', 400);
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, 'Unexpected file field', 400);
    }
  }
  
  if (err.message === 'File type not supported') {
    return errorResponse(res, 'File type not supported', 400);
  }
  
  next(err);
};

/**
 * Development error handler
 */
const developmentErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
    
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }
  
  next(err);
};

/**
 * Production error handler
 */
const productionErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Log error for monitoring
    console.error('Production Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Don't leak error details in production
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;
    
    return errorResponse(res, message, statusCode);
  }
  
  next(err);
};

/**
 * Combined error handler middleware
 */
const combinedErrorHandler = [
  notFound,
  validationErrorHandler,
  prismaErrorHandler,
  jwtErrorHandler,
  multerErrorHandler,
  developmentErrorHandler,
  productionErrorHandler,
  errorHandler
];

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  validationErrorHandler,
  prismaErrorHandler,
  jwtErrorHandler,
  multerErrorHandler,
  developmentErrorHandler,
  productionErrorHandler,
  combinedErrorHandler
};

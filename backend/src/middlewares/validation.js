const Joi = require('joi');
const { AppError } = require('../utils/errors');

/**
 * Validation middleware factory
 * Creates middleware that validates request against Joi schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message.replace(/"/g, ''))
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

/**
 * Query parameter validation middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message.replace(/"/g, ''))
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    req.query = value;
    next();
  };
};

/**
 * Route parameter validation middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message.replace(/"/g, ''))
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    req.params = value;
    next();
  };
};

/**
 * File upload validation middleware
 */
const validateFileUpload = (options = {}) => {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize = 5 * 1024 * 1024, // 5MB
    required = false
  } = options;

  return (req, res, next) => {
    const file = req.file;

    if (required && !file) {
      return next(new AppError('File is required', 400));
    }

    if (file) {
      // Check file size
      if (file.size > maxSize) {
        return next(new AppError('File size too large', 400));
      }

      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return next(new AppError('Invalid file type', 400));
      }
    }

    next();
  };
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  validateFileUpload
};

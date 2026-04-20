/**
 * Standardized API response utility
 * Provides consistent response format across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data
  };

  // Add pagination if present
  if (data && data.pagination) {
    response.pagination = data.pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Detailed error information
 */
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created response
 * @param {Object} res - Express response object
 * @param {Object} data - Created data
 * @param {string} message - Success message
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * Updated response
 * @param {Object} res - Express response object
 * @param {Object} data - Updated data
 * @param {string} message - Success message
 */
const updatedResponse = (res, data, message = 'Resource updated successfully') => {
  return successResponse(res, data, message, 200);
};

/**
 * Deleted response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return successResponse(res, null, message, 200);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  return successResponse(res, data, message, 200);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Validation errors
 * @param {string} message - Error message
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return errorResponse(res, message, 400, errors);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

/**
 * Conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflictResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

/**
 * Too many requests response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const tooManyRequestsResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429);
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  paginatedResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  tooManyRequestsResponse
};

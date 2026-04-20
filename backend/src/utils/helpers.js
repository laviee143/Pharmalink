/**
 * Async handler wrapper
 * Wraps async functions to catch errors and pass them to error handler middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Generate pagination parameters
 */
const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip
  };
};

/**
 * Format pagination response
 */
const formatPagination = (page, limit, total) => {
  return {
    currentPage: page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

/**
 * Generate slug from string
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Generate unique identifier
 */
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Format date
 */
const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options })
    .format(new Date(date));
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Sanitize string
 */
const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined values from object
 */
const removeUndefined = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Parse sort parameter
 */
const parseSortParam = (sortParam, defaultSort = { createdAt: 'desc' }) => {
  if (!sortParam) return defaultSort;

  const [field, order] = sortParam.split(':');
  const validOrders = ['asc', 'desc'];

  if (!field || !validOrders.includes(order)) {
    return defaultSort;
  }

  return { [field]: order };
};

/**
 * Parse filter parameters
 */
const parseFilters = (filters, allowedFilters = {}) => {
  const parsedFilters = {};

  Object.keys(filters).forEach(key => {
    if (allowedFilters[key] !== undefined) {
      parsedFilters[key] = filters[key];
    }
  });

  return parsedFilters;
};

module.exports = {
  asyncHandler,
  getPagination,
  formatPagination,
  generateSlug,
  generateId,
  formatCurrency,
  formatDate,
  calculateAge,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  deepClone,
  removeUndefined,
  isEmpty,
  generateRandomString,
  parseSortParam,
  parseFilters
};

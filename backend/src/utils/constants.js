/**
 * Application constants
 * Centralized configuration for all system constants
 */

// User roles
const USER_ROLES = {
  ADMIN: 'ADMIN',
  PHARMACY: 'PHARMACY',
  WHOLESALER: 'WHOLESALER'
};

// User permissions
const PERMISSIONS = {
  // Admin permissions
  ADMIN: [
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'medicine:create',
    'medicine:read',
    'medicine:update',
    'medicine:delete',
    'order:create',
    'order:read',
    'order:update',
    'order:delete',
    'payment:create',
    'payment:read',
    'payment:update',
    'inventory:read',
    'inventory:update',
    'message:create',
    'message:read',
    'message:delete',
    'notification:create',
    'notification:read',
    'report:read'
  ],
  // Pharmacy permissions
  PHARMACY: [
    'user:read:own',
    'medicine:read',
    'order:create',
    'order:read:own',
    'order:update:own',
    'payment:create',
    'payment:read:own',
    'inventory:read',
    'inventory:update:own',
    'message:create',
    'message:read:own',
    'notification:read:own',
    'report:read:own'
  ],
  // Wholesaler permissions
  WHOLESALER: [
    'user:read:own',
    'medicine:create',
    'medicine:read',
    'medicine:update:own',
    'medicine:delete:own',
    'order:read',
    'order:update',
    'payment:read',
    'inventory:read',
    'inventory:update:own',
    'message:create',
    'message:read:own',
    'notification:read:own',
    'report:read:own'
  ]
};

// Medicine categories
const MEDICINE_CATEGORIES = {
  ANTIBIOTICS: 'ANTIBIOTICS',
  PAIN_RELIEVERS: 'PAIN_RELIEVERS',
  VITAMINS: 'VITAMINS',
  COLD_FLU: 'COLD_FLU',
  ALLERGY: 'ALLERGY',
  DIABETES: 'DIABETES',
  HEART: 'HEART',
  DIGESTIVE: 'DIGESTIVE',
  SKIN_CARE: 'SKIN_CARE',
  EYE_CARE: 'EYE_CARE',
  FIRST_AID: 'FIRST_AID',
  PRESCRIPTION: 'PRESCRIPTION',
  OVER_THE_COUNTER: 'OVER_THE_COUNTER'
};

// Medicine forms
const MEDICINE_FORMS = {
  TABLET: 'TABLET',
  CAPSULE: 'CAPSULE',
  LIQUID: 'LIQUID',
  CREAM: 'CREAM',
  OINTMENT: 'OINTMENT',
  INJECTION: 'INJECTION',
  INHALER: 'INHALER',
  SPRAY: 'SPRAY',
  DROPS: 'DROPS',
  PATCH: 'PATCH',
  SUPPOSITORY: 'SUPPOSITORY',
  POWDER: 'POWDER'
};

// Order statuses
const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
};

// Payment statuses
const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

// Payment methods
const PAYMENT_METHODS = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  DIGITAL_WALLET: 'DIGITAL_WALLET'
};

// Message types
const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  DOCUMENT: 'DOCUMENT',
  VOICE: 'VOICE',
  VIDEO: 'VIDEO'
};

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  LOW_STOCK: 'LOW_STOCK',
  EXPIRING_SOON: 'EXPIRING_SOON',
  NEW_MESSAGE: 'NEW_MESSAGE',
  SYSTEM_UPDATE: 'SYSTEM_UPDATE'
};

// Notification channels
const NOTIFICATION_CHANNELS = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP'
};

// File upload limits
const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Rate limiting
const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 attempts per window
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  },
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 uploads per window
  }
};

// JWT configuration
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  ORDER_CONFIRMATION: 'order-confirmation',
  PAYMENT_CONFIRMATION: 'payment-confirmation',
  SHIPPING_NOTIFICATION: 'shipping-notification',
  LOW_STOCK_ALERT: 'low-stock-alert'
};

// Cache keys
const CACHE_KEYS = {
  USER: (id) => `user:${id}`,
  MEDICINE: (id) => `medicine:${id}`,
  INVENTORY: (id) => `inventory:${id}`,
  ORDER: (id) => `order:${id}`,
  SESSION: (id) => `session:${id}`,
  RATE_LIMIT: (key) => `rate_limit:${key}`
};

// Cache TTL (time to live) in seconds
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// Validation patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9-]+$/
};

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR'
};

// API versions
const API_VERSIONS = {
  V1: 'v1',
  CURRENT: 'v1'
};

// Environment variables
const ENV_VARS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  REDIS_URL: 'REDIS_URL',
  JWT_SECRET: 'JWT_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  EMAIL_HOST: 'EMAIL_HOST',
  EMAIL_PORT: 'EMAIL_PORT',
  EMAIL_USER: 'EMAIL_USER',
  EMAIL_PASS: 'EMAIL_PASS',
  FRONTEND_URL: 'FRONTEND_URL',
  UPLOAD_PATH: 'UPLOAD_PATH',
  LOG_LEVEL: 'LOG_LEVEL'
};

module.exports = {
  USER_ROLES,
  PERMISSIONS,
  MEDICINE_CATEGORIES,
  MEDICINE_FORMS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  FILE_UPLOAD_LIMITS,
  PAGINATION,
  RATE_LIMITS,
  JWT_CONFIG,
  EMAIL_TEMPLATES,
  CACHE_KEYS,
  CACHE_TTL,
  VALIDATION_PATTERNS,
  ERROR_CODES,
  API_VERSIONS,
  ENV_VARS
};

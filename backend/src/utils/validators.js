const Joi = require('joi');
const { VALIDATION_PATTERNS } = require('./constants');

/**
 * Common validation schemas
 * Reusable Joi schemas for common validation patterns
 */

// Common schemas
const commonSchemas = {
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(VALIDATION_PATTERNS.PASSWORD)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  phone: Joi.string().pattern(VALIDATION_PATTERNS.PHONE).required(),
  name: Joi.string().trim().min(2).max(50).required(),
  address: Joi.string().trim().max(200),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  sort: Joi.string().pattern(/^[a-zA-Z_]+:(asc|desc)$/).optional(),
  search: Joi.string().trim().max(100).optional()
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    role: Joi.string().valid('ADMIN', 'PHARMACY', 'WHOLESALER').default('PHARMACY'),
    phone: commonSchemas.phone,
    address: commonSchemas.address
  }),
  
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required()
  }),
  
  updateProfile: Joi.object({
    firstName: commonSchemas.name.optional(),
    lastName: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional(),
    address: commonSchemas.address.optional()
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password
  })
};

// Medicine validation schemas
const medicineSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    genericName: Joi.string().trim().max(100),
    description: Joi.string().trim().max(500),
    category: Joi.string().valid(...Object.values(require('./constants').MEDICINE_CATEGORIES)).required(),
    brand: Joi.string().trim().max(50),
    strength: Joi.string().trim().max(20),
    form: Joi.string().valid(...Object.values(require('./constants').MEDICINE_FORMS)).required(),
    unitPrice: Joi.number().positive().precision(2).required(),
    manufacturer: Joi.string().trim().max(100),
    barcode: Joi.string().trim().max(50),
    requiresPrescription: Joi.boolean().default(false),
    storageConditions: Joi.string().trim().max(200),
    sideEffects: Joi.string().trim().max(500),
    contraindications: Joi.string().trim().max(500),
    dosage: Joi.string().trim().max(200)
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    genericName: Joi.string().trim().max(100),
    description: Joi.string().trim().max(500),
    category: Joi.string().valid(...Object.values(require('./constants').MEDICINE_CATEGORIES)),
    brand: Joi.string().trim().max(50),
    strength: Joi.string().trim().max(20),
    form: Joi.string().valid(...Object.values(require('./constants').MEDICINE_FORMS)),
    unitPrice: Joi.number().positive().precision(2),
    manufacturer: Joi.string().trim().max(100),
    barcode: Joi.string().trim().max(50),
    requiresPrescription: Joi.boolean(),
    storageConditions: Joi.string().trim().max(200),
    sideEffects: Joi.string().trim().max(500),
    contraindications: Joi.string().trim().max(500),
    dosage: Joi.string().trim().max(200),
    isActive: Joi.boolean()
  })
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    customerId: commonSchemas.id,
    items: Joi.array().items(
      Joi.object({
        medicineId: commonSchemas.id,
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().positive().precision(2).required()
      })
    ).min(1).required(),
    shippingAddress: Joi.string().trim().max(200).required(),
    deliveryInstructions: Joi.string().trim().max(500),
    notes: Joi.string().trim().max(500)
  }),
  
  update: Joi.object({
    status: Joi.string().valid(...Object.values(require('./constants').ORDER_STATUSES)),
    trackingNumber: Joi.string().trim().max(50),
    estimatedDeliveryDate: Joi.date().iso(),
    notes: Joi.string().trim().max(500)
  })
};

// Payment validation schemas
const paymentSchemas = {
  create: Joi.object({
    orderId: commonSchemas.id,
    amount: Joi.number().positive().precision(2).required(),
    method: Joi.string().valid(...Object.values(require('./constants').PAYMENT_METHODS)).required(),
    currency: Joi.string().default('USD'),
    transactionId: Joi.string().trim().max(100),
    notes: Joi.string().trim().max(500)
  }),
  
  update: Joi.object({
    status: Joi.string().valid(...Object.values(require('./constants').PAYMENT_STATUSES)),
    transactionId: Joi.string().trim().max(100),
    notes: Joi.string().trim().max(500)
  })
};

// Inventory validation schemas
const inventorySchemas = {
  create: Joi.object({
    medicineId: commonSchemas.id,
    quantity: Joi.number().integer().min(0).required(),
    batchNumber: Joi.string().trim().max(50),
    expiryDate: Joi.date().iso().required(),
    purchasePrice: Joi.number().positive().precision(2),
    location: Joi.string().trim().max(100),
    notes: Joi.string().trim().max(500)
  }),
  
  update: Joi.object({
    quantity: Joi.number().integer().min(0),
    location: Joi.string().trim().max(100),
    notes: Joi.string().trim().max(500)
  })
};

// Message validation schemas
const messageSchemas = {
  create: Joi.object({
    receiverId: commonSchemas.id,
    type: Joi.string().valid(...Object.values(require('./constants').MESSAGE_TYPES)).required(),
    content: Joi.string().trim().max(1000).required(),
    orderId: commonSchemas.id.optional(),
    attachments: Joi.array().items(
      Joi.object({
        filename: Joi.string().trim().max(255).required(),
        originalName: Joi.string().trim().max(255).required(),
        mimeType: Joi.string().required(),
        size: Joi.number().max(5 * 1024 * 1024).required(), // 5MB
        path: Joi.string().trim().max(500).required()
      })
    ).max(5)
  })
};

// Notification validation schemas
const notificationSchemas = {
  create: Joi.object({
    userId: commonSchemas.id,
    type: Joi.string().valid(...Object.values(require('./constants').NOTIFICATION_TYPES)).required(),
    title: Joi.string().trim().max(100).required(),
    message: Joi.string().trim().max(500).required(),
    channels: Joi.array().items(
      Joi.string().valid(...Object.values(require('./constants').NOTIFICATION_CHANNELS))
    ).default(['IN_APP']),
    data: Joi.object().optional()
  })
};

// Authentication validation schemas
const authSchemas = {
  register: userSchemas.register,
  login: userSchemas.login,
  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),
  forgotPassword: Joi.object({
    email: commonSchemas.email
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: commonSchemas.password
  }),
  verifyEmail: Joi.object({
    token: Joi.string().required()
  })
};

// Query validation schemas
const querySchemas = {
  pagination: commonSchemas.pagination,
  search: Joi.object({
    q: commonSchemas.search,
    page: commonSchemas.pagination.extract('page'),
    limit: commonSchemas.pagination.extract('limit'),
    sort: commonSchemas.sort
  }),
  medicineSearch: Joi.object({
    q: commonSchemas.search,
    category: Joi.string().valid(...Object.values(require('./constants').MEDICINE_CATEGORIES)),
    form: Joi.string().valid(...Object.values(require('./constants').MEDICINE_FORMS)),
    requiresPrescription: Joi.boolean(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    page: commonSchemas.pagination.extract('page'),
    limit: commonSchemas.pagination.extract('limit'),
    sort: commonSchemas.sort
  }),
  orderSearch: Joi.object({
    status: Joi.string().valid(...Object.values(require('./constants').ORDER_STATUSES)),
    customerId: commonSchemas.id.optional(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    page: commonSchemas.pagination.extract('page'),
    limit: commonSchemas.pagination.extract('limit'),
    sort: commonSchemas.sort
  })
};

// Parameter validation schemas
const paramSchemas = {
  id: Joi.object({
    id: commonSchemas.id
  }),
  uuid: Joi.object({
    uuid: Joi.string().uuid().required()
  })
};

module.exports = {
  commonSchemas,
  userSchemas,
  medicineSchemas,
  orderSchemas,
  paymentSchemas,
  inventorySchemas,
  messageSchemas,
  notificationSchemas,
  authSchemas,
  querySchemas,
  paramSchemas
};

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PharmaLink API',
      version: '1.0.0',
      description: 'A comprehensive pharmacy management system API',
      contact: {
        name: 'PharmaLink Team',
        email: 'support@pharmalink.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.pharmalink.com' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            id: { type: 'string', format: 'cuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { 
              type: 'string', 
              enum: ['ADMIN', 'PHARMACIST', 'CASHIER'],
              default: 'PHARMACIST'
            },
            phone: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Medicine: {
          type: 'object',
          required: ['name', 'category', 'unitPrice'],
          properties: {
            id: { type: 'string', format: 'cuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            brand: { type: 'string' },
            genericName: { type: 'string' },
            strength: { type: 'string' },
            form: { type: 'string' },
            unitPrice: { type: 'number' },
            stock: { type: 'integer' },
            minStock: { type: 'integer' },
            expiryDate: { type: 'string', format: 'date' },
            manufacturer: { type: 'string' },
            barcode: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Customer: {
          type: 'object',
          required: ['firstName', 'lastName', 'phone'],
          properties: {
            id: { type: 'string', format: 'cuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            allergies: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Prescription: {
          type: 'object',
          required: ['customerId', 'pharmacistId'],
          properties: {
            id: { type: 'string', format: 'cuid' },
            prescriptionNumber: { type: 'string' },
            customerId: { type: 'string', format: 'cuid' },
            pharmacistId: { type: 'string', format: 'cuid' },
            doctorName: { type: 'string' },
            diagnosis: { type: 'string' },
            notes: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
              default: 'PENDING'
            },
            totalAmount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Invoice: {
          type: 'object',
          required: ['customerId', 'pharmacistId', 'subtotal', 'totalAmount', 'paymentMethod'],
          properties: {
            id: { type: 'string', format: 'cuid' },
            invoiceNumber: { type: 'string' },
            customerId: { type: 'string', format: 'cuid' },
            pharmacistId: { type: 'string', format: 'cuid' },
            prescriptionId: { type: 'string', format: 'cuid' },
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            totalAmount: { type: 'number' },
            paymentMethod: { 
              type: 'string', 
              enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE']
            },
            paymentStatus: { 
              type: 'string', 
              enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED'],
              default: 'PENDING'
            },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            stack: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;

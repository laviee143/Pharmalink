const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV${year}${month}${day}${random}`;
};

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices with pagination and filtering
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, PARTIALLY_PAID, REFUNDED]
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 */
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('paymentStatus').optional().isIn(['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED']),
  query('customerId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { paymentStatus, customerId } = req.query;

    // Build where clause
    const where = {};
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          pharmacist: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          prescription: {
            select: {
              id: true,
              prescriptionNumber: true
            }
          },
          items: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve invoices'
    });
  }
});

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        pharmacist: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        prescription: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        items: {
          include: {
            medicine: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Invoice with this ID does not exist'
      });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve invoice'
    });
  }
});

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *               - paymentMethod
 *             properties:
 *               customerId:
 *                 type: string
 *               prescriptionId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CREDIT_CARD, DEBIT_CARD, INSURANCE]
 *               notes:
 *                 type: string
 *               tax:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - medicineId
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth, [
  body('customerId').isString(),
  body('prescriptionId').optional().isString(),
  body('paymentMethod').isIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE']),
  body('notes').optional().trim(),
  body('tax').optional().isFloat({ min: 0 }),
  body('items').isArray({ min: 1 }),
  body('items.*.medicineId').isString(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.unitPrice').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      customerId,
      prescriptionId,
      paymentMethod,
      notes,
      tax = 0,
      items
    } = req.body;

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer with this ID does not exist'
      });
    }

    // Verify prescription exists if provided
    if (prescriptionId) {
      const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId }
      });

      if (!prescription) {
        return res.status(404).json({
          error: 'Prescription not found',
          message: 'Prescription with this ID does not exist'
        });
      }
    }

    // Verify all medicines exist and check stock
    const medicineIds = items.map(item => item.medicineId);
    const medicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } }
    });

    if (medicines.length !== medicineIds.length) {
      return res.status(400).json({
        error: 'Invalid medicines',
        message: 'One or more medicines not found'
      });
    }

    // Check stock availability
    for (const item of items) {
      const medicine = medicines.find(m => m.id === item.medicineId);
      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Medicine ${medicine.name} has insufficient stock. Available: ${medicine.stock}, Required: ${item.quantity}`
        });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalAmount = subtotal + tax;

    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(),
          customerId,
          pharmacistId: req.user.id,
          prescriptionId,
          subtotal,
          tax,
          totalAmount,
          paymentMethod,
          paymentStatus: 'PENDING',
          notes
        }
      });

      // Create invoice items and update stock
      for (const item of items) {
        const total = item.unitPrice * item.quantity;
        
        await tx.invoiceItem.create({
          data: {
            invoiceId: newInvoice.id,
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total
          }
        });

        // Update medicine stock
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newInvoice;
    });

    // Fetch the complete invoice with relations
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        pharmacist: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        prescription: {
          select: {
            id: true,
            prescriptionNumber: true
          }
        },
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                unitPrice: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: completeInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create invoice'
    });
  }
});

/**
 * @swagger
 * /api/invoices/{id}/payment-status:
 *   put:
 *     summary: Update invoice payment status
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [PENDING, PAID, PARTIALLY_PAID, REFUNDED]
 *     responses:
 *       200:
 *         description: Invoice payment status updated successfully
 *       404:
 *         description: Invoice not found
 */
router.put('/:id/payment-status', auth, authorize('ADMIN', 'CASHIER'), [
  body('paymentStatus').isIn(['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const invoiceExists = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoiceExists) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Invoice with this ID does not exist'
      });
    }

    const { paymentStatus } = req.body;

    await prisma.invoice.update({
      where: { id: req.params.id },
      data: { paymentStatus }
    });

    res.json({
      message: 'Invoice payment status updated successfully',
      paymentStatus
    });
  } catch (error) {
    console.error('Update invoice payment status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update invoice payment status'
    });
  }
});

module.exports = router;

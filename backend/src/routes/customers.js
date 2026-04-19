const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers with pagination and filtering
 *     tags: [Customers]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 */
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim()
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
    const { search } = req.query;

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastName: 'asc' },
        include: {
          _count: {
            select: {
              prescriptions: true,
              invoices: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve customers'
    });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
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
 *         description: Customer retrieved successfully
 *       404:
 *         description: Customer not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            pharmacist: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer with this ID does not exist'
      });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve customer'
    });
  }
});

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Customer already exists
 */
router.post('/', auth, [
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('phone').trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('allergies').optional().trim()
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
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      allergies
    } = req.body;

    // Check email uniqueness if provided
    if (email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email }
      });

      if (existingCustomer) {
        return res.status(409).json({
          error: 'Customer already exists',
          message: 'A customer with this email already exists'
        });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth,
        allergies
      }
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create customer'
    });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
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
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 */
router.put('/:id', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('allergies').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const customerExists = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });

    if (!customerExists) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer with this ID does not exist'
      });
    }

    const updateData = req.body;

    // Check email uniqueness if being updated
    if (updateData.email && updateData.email !== customerExists.email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: updateData.email }
      });

      if (existingCustomer) {
        return res.status(409).json({
          error: 'Customer already exists',
          message: 'A customer with this email already exists'
        });
      }
    }

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update customer'
    });
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
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
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Customer has associated records
 */
router.delete('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const customerExists = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            prescriptions: true,
            invoices: true
          }
        }
      }
    });

    if (!customerExists) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer with this ID does not exist'
      });
    }

    // Check if customer has associated records
    if (customerExists._count.prescriptions > 0 || customerExists._count.invoices > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer',
        message: 'Customer has associated prescriptions or invoices'
      });
    }

    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete customer'
    });
  }
});

module.exports = router;

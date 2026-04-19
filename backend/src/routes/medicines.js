const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/medicines:
 *   get:
 *     summary: Get all medicines with pagination and filtering
 *     tags: [Medicines]
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Medicines retrieved successfully
 */
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('isActive').optional().isBoolean()
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
    const { search, category, isActive } = req.query;

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.medicine.count({ where })
    ]);

    res.json({
      medicines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve medicines'
    });
  }
});

/**
 * @swagger
 * /api/medicines/{id}:
 *   get:
 *     summary: Get medicine by ID
 *     tags: [Medicines]
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
 *         description: Medicine retrieved successfully
 *       404:
 *         description: Medicine not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: req.params.id }
    });

    if (!medicine) {
      return res.status(404).json({
        error: 'Medicine not found',
        message: 'Medicine with this ID does not exist'
      });
    }

    res.json({ medicine });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve medicine'
    });
  }
});

/**
 * @swagger
 * /api/medicines:
 *   post:
 *     summary: Create new medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medicine'
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Medicine already exists
 */
router.post('/', auth, authorize('ADMIN', 'PHARMACIST'), [
  body('name').trim().isLength({ min: 1 }),
  body('category').trim().isLength({ min: 1 }),
  body('unitPrice').isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('minStock').optional().isInt({ min: 0 }),
  body('strength').optional().trim(),
  body('form').optional().trim(),
  body('brand').optional().trim(),
  body('genericName').optional().trim(),
  body('manufacturer').optional().trim(),
  body('barcode').optional().trim(),
  body('expiryDate').optional().isISO8601().toDate(),
  body('description').optional().trim()
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
      name,
      description,
      category,
      brand,
      genericName,
      strength,
      form,
      unitPrice,
      stock = 0,
      minStock = 10,
      expiryDate,
      manufacturer,
      barcode
    } = req.body;

    // Check if medicine already exists
    const existingMedicine = await prisma.medicine.findUnique({
      where: { name }
    });

    if (existingMedicine) {
      return res.status(409).json({
        error: 'Medicine already exists',
        message: 'A medicine with this name already exists'
      });
    }

    // Check barcode uniqueness if provided
    if (barcode) {
      const existingBarcode = await prisma.medicine.findUnique({
        where: { barcode }
      });

      if (existingBarcode) {
        return res.status(409).json({
          error: 'Barcode already exists',
          message: 'A medicine with this barcode already exists'
        });
      }
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        description,
        category,
        brand,
        genericName,
        strength,
        form,
        unitPrice,
        stock,
        minStock,
        expiryDate,
        manufacturer,
        barcode
      }
    });

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create medicine'
    });
  }
});

/**
 * @swagger
 * /api/medicines/{id}:
 *   put:
 *     summary: Update medicine
 *     tags: [Medicines]
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
 *             $ref: '#/components/schemas/Medicine'
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *       404:
 *         description: Medicine not found
 */
router.put('/:id', auth, authorize('ADMIN', 'PHARMACIST'), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('unitPrice').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('minStock').optional().isInt({ min: 0 }),
  body('strength').optional().trim(),
  body('form').optional().trim(),
  body('brand').optional().trim(),
  body('genericName').optional().trim(),
  body('manufacturer').optional().trim(),
  body('barcode').optional().trim(),
  body('expiryDate').optional().isISO8601().toDate(),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const medicineExists = await prisma.medicine.findUnique({
      where: { id: req.params.id }
    });

    if (!medicineExists) {
      return res.status(404).json({
        error: 'Medicine not found',
        message: 'Medicine with this ID does not exist'
      });
    }

    const updateData = req.body;

    // Check name uniqueness if being updated
    if (updateData.name && updateData.name !== medicineExists.name) {
      const existingMedicine = await prisma.medicine.findUnique({
        where: { name: updateData.name }
      });

      if (existingMedicine) {
        return res.status(409).json({
          error: 'Medicine already exists',
          message: 'A medicine with this name already exists'
        });
      }
    }

    // Check barcode uniqueness if being updated
    if (updateData.barcode && updateData.barcode !== medicineExists.barcode) {
      const existingBarcode = await prisma.medicine.findUnique({
        where: { barcode: updateData.barcode }
      });

      if (existingBarcode) {
        return res.status(409).json({
          error: 'Barcode already exists',
          message: 'A medicine with this barcode already exists'
        });
      }
    }

    const medicine = await prisma.medicine.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      message: 'Medicine updated successfully',
      medicine
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update medicine'
    });
  }
});

/**
 * @swagger
 * /api/medicines/{id}:
 *   delete:
 *     summary: Delete medicine
 *     tags: [Medicines]
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
 *         description: Medicine deleted successfully
 *       404:
 *         description: Medicine not found
 */
router.delete('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const medicineExists = await prisma.medicine.findUnique({
      where: { id: req.params.id }
    });

    if (!medicineExists) {
      return res.status(404).json({
        error: 'Medicine not found',
        message: 'Medicine with this ID does not exist'
      });
    }

    await prisma.medicine.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete medicine'
    });
  }
});

/**
 * @swagger
 * /api/medicines/low-stock:
 *   get:
 *     summary: Get medicines with low stock
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock medicines retrieved successfully
 */
router.get('/reports/low-stock', auth, async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: {
        AND: [
          { isActive: true },
          { stock: { lte: prisma.medicine.fields.minStock } }
        ]
      },
      orderBy: { stock: 'asc' }
    });

    res.json({
      medicines,
      count: medicines.length
    });
  } catch (error) {
    console.error('Get low stock medicines error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve low stock medicines'
    });
  }
});

/**
 * @swagger
 * /api/medicines/expiring:
 *   get:
 *     summary: Get medicines expiring soon
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Expiring medicines retrieved successfully
 */
router.get('/reports/expiring', auth, [
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const days = parseInt(req.query.days) || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const medicines = await prisma.medicine.findMany({
      where: {
        AND: [
          { isActive: true },
          { expiryDate: { not: null } },
          { expiryDate: { lte: expiryDate } }
        ]
      },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({
      medicines,
      count: medicines.length,
      daysThreshold: days
    });
  } catch (error) {
    console.error('Get expiring medicines error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve expiring medicines'
    });
  }
});

module.exports = router;

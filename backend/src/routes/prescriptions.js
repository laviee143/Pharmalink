const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate prescription number
const generatePrescriptionNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RX${year}${month}${day}${random}`;
};

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Get all prescriptions with pagination and filtering
 *     tags: [Prescriptions]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, CANCELLED]
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 */
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']),
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
    const { status, customerId } = req.query;

    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
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
      }),
      prisma.prescription.count({ where })
    ]);

    res.json({
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve prescriptions'
    });
  }
});

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
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
 *         description: Prescription retrieved successfully
 *       404:
 *         description: Prescription not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
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
        items: {
          include: {
            medicine: true
          }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
        message: 'Prescription with this ID does not exist'
      });
    }

    res.json({ prescription });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve prescription'
    });
  }
});

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create new prescription
 *     tags: [Prescriptions]
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
 *             properties:
 *               customerId:
 *                 type: string
 *               doctorName:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - medicineId
 *                     - quantity
 *                     - price
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     dosage:
 *                       type: string
 *                     instructions:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth, authorize('ADMIN', 'PHARMACIST'), [
  body('customerId').isString(),
  body('doctorName').optional().trim(),
  body('diagnosis').optional().trim(),
  body('notes').optional().trim(),
  body('items').isArray({ min: 1 }),
  body('items.*.medicineId').isString(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.dosage').optional().trim(),
  body('items.*.instructions').optional().trim(),
  body('items.*.price').isFloat({ min: 0 })
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
      doctorName,
      diagnosis,
      notes,
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

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const prescription = await prisma.$transaction(async (tx) => {
      // Create prescription
      const newPrescription = await tx.prescription.create({
        data: {
          prescriptionNumber: generatePrescriptionNumber(),
          customerId,
          pharmacistId: req.user.id,
          doctorName,
          diagnosis,
          notes,
          totalAmount,
          status: 'PENDING'
        }
      });

      // Create prescription items and update stock
      for (const item of items) {
        await tx.prescriptionItem.create({
          data: {
            prescriptionId: newPrescription.id,
            medicineId: item.medicineId,
            quantity: item.quantity,
            dosage: item.dosage,
            instructions: item.instructions,
            price: item.price
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

      return newPrescription;
    });

    // Fetch the complete prescription with relations
    const completePrescription = await prisma.prescription.findUnique({
      where: { id: prescription.id },
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
      message: 'Prescription created successfully',
      prescription: completePrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create prescription'
    });
  }
});

/**
 * @swagger
 * /api/prescriptions/{id}/status:
 *   put:
 *     summary: Update prescription status
 *     tags: [Prescriptions]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Prescription status updated successfully
 *       404:
 *         description: Prescription not found
 */
router.put('/:id/status', auth, authorize('ADMIN', 'PHARMACIST'), [
  body('status').isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: req.params.id }
    });

    if (!prescriptionExists) {
      return res.status(404).json({
        error: 'Prescription not found',
        message: 'Prescription with this ID does not exist'
      });
    }

    const { status } = req.body;

    // If cancelling, restore stock
    if (status === 'CANCELLED' && prescriptionExists.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        // Get prescription items
        const items = await tx.prescriptionItem.findMany({
          where: { prescriptionId: req.params.id }
        });

        // Restore stock for each item
        for (const item of items) {
          await tx.medicine.update({
            where: { id: item.medicineId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }

        // Update prescription status
        await tx.prescription.update({
          where: { id: req.params.id },
          data: { status }
        });
      });
    } else {
      // Just update status
      await prisma.prescription.update({
        where: { id: req.params.id },
        data: { status }
      });
    }

    res.json({
      message: 'Prescription status updated successfully',
      status
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update prescription status'
    });
  }
});

module.exports = router;

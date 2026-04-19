const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, PHARMACIST, CASHIER]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', auth, authorize('ADMIN'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['ADMIN', 'PHARMACIST', 'CASHIER']),
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
    const { role, search } = req.query;

    // Build where clause
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve users'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with this ID does not exist'
      });
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, PHARMACIST, CASHIER]
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('role').optional().isIn(['ADMIN', 'PHARMACIST', 'CASHIER']),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('password').optional().isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!userExists) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with this ID does not exist'
      });
    }

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own profile'
      });
    }

    const updateData = { ...req.body };

    // Only admins can change roles
    if (req.user.role !== 'ADMIN') {
      delete updateData.role;
    }

    // Hash password if provided
    if (updateData.password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Cannot delete user with associated records
 */
router.delete('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const userExists = await prisma.user.findUnique({
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

    if (!userExists) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with this ID does not exist'
      });
    }

    // Prevent self-deletion
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        error: 'Cannot delete account',
        message: 'You cannot delete your own account'
      });
    }

    // Check if user has associated records
    if (userExists._count.prescriptions > 0 || userExists._count.invoices > 0) {
      return res.status(400).json({
        error: 'Cannot delete user',
        message: 'User has associated prescriptions or invoices'
      });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;

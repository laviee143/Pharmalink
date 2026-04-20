const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');

class InventoryService {
  /**
   * Get all inventory items with pagination and filtering
   */
  async getInventory(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      medicineId, 
      userId,
      lowStock, 
      expiringSoon,
      location
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = {};
    
    if (userId) {
      where.userId = userId;
    }

    if (medicineId) {
      where.medicineId = medicineId;
    }

    if (lowStock) {
      where.quantity = { lte: prisma.inventory.fields.minStockLevel };
    }

    if (expiringSoon) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      where.expiryDate = { lte: expiryDate };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take,
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              category: true,
              unitPrice: true,
              requiresPrescription: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventory.count({ where })
    ]);

    return {
      inventory,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryById(id, requestingUser) {
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        medicine: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }

    // Check permissions - users can only view their own inventory, admins can view all
    if (requestingUser.role !== 'ADMIN' && inventory.userId !== requestingUser.id) {
      throw new AppError('Access denied', 403);
    }

    return inventory;
  }

  /**
   * Add inventory item
   */
  async addInventoryItem(inventoryData) {
    const { medicineId, userId, quantity, batchNumber, expiryDate, purchasePrice, location, minStockLevel, notes } = inventoryData;

    // Check if medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId, isActive: true }
    });

    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    const inventory = await prisma.inventory.create({
      data: {
        medicineId,
        userId,
        quantity,
        batchNumber,
        expiryDate,
        purchasePrice,
        location,
        minStockLevel,
        notes
      },
      include: {
        medicine: true
      }
    });

    return inventory;
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id, updateData, requestingUser) {
    // Check if inventory exists and user has permission
    const existingInventory = await prisma.inventory.findUnique({
      where: { id }
    });

    if (!existingInventory) {
      throw new AppError('Inventory item not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && existingInventory.userId !== requestingUser.id) {
      throw new AppError('Access denied', 403);
    }

    const inventory = await prisma.inventory.update({
      where: { id },
      data: updateData,
      include: {
        medicine: true
      }
    });

    return inventory;
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id, requestingUser) {
    // Check if inventory exists and user has permission
    const existingInventory = await prisma.inventory.findUnique({
      where: { id }
    });

    if (!existingInventory) {
      throw new AppError('Inventory item not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && existingInventory.userId !== requestingUser.id) {
      throw new AppError('Access denied', 403);
    }

    await prisma.inventory.delete({
      where: { id }
    });
  }

  /**
   * Adjust inventory stock
   */
  async adjustStock(id, quantity, reason, requestingUser) {
    const inventory = await prisma.inventory.findUnique({
      where: { id }
    });

    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && inventory.userId !== requestingUser.id) {
      throw new AppError('Access denied', 403);
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: { quantity }
    });

    // Log stock adjustment
    await prisma.stockAdjustment.create({
      data: {
        inventoryId: id,
        previousQuantity: inventory.quantity,
        newQuantity: quantity,
        reason,
        adjustedBy: requestingUser.id
      }
    });

    return updatedInventory;
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(userId) {
    const alerts = await prisma.inventory.findMany({
      where: {
        userId,
        quantity: { lte: prisma.inventory.fields.minStockLevel }
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            category: true,
            unitPrice: true
          }
        }
      },
      orderBy: { quantity: 'asc' }
    });

    return alerts;
  }

  /**
   * Get expiring items
   */
  async getExpiringItems(userId, days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const items = await prisma.inventory.findMany({
      where: {
        userId,
        expiryDate: { lte: expiryDate }
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            category: true,
            unitPrice: true
          }
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    return items;
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(userId) {
    const [
      totalItems,
      lowStockItems,
      expiringItems,
      totalValue
    ] = await Promise.all([
      prisma.inventory.count({
        where: { userId }
      }),
      prisma.inventory.count({
        where: {
          userId,
          quantity: { lte: prisma.inventory.fields.minStockLevel }
        }
      }),
      prisma.inventory.count({
        where: {
          userId,
          expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.inventory.aggregate({
        where: { userId },
        _sum: { quantity: true }
      })
    ]);

    return {
      totalItems,
      lowStockItems,
      expiringItems,
      totalValue: totalValue._sum.quantity || 0
    };
  }

  /**
   * Bulk update inventory
   */
  async bulkUpdateInventory(items, userId) {
    const results = await prisma.$transaction(
      items.map(item => 
        prisma.inventory.upsert({
          where: {
            medicineId_userId: {
              medicineId: item.medicineId,
              userId
            }
          },
          update: {
            quantity: item.quantity,
            location: item.location,
            minStockLevel: item.minStockLevel,
            notes: item.notes
          },
          create: {
            medicineId: item.medicineId,
            userId,
            quantity: item.quantity,
            location: item.location,
            minStockLevel: item.minStockLevel,
            notes: item.notes
          }
        })
      )
    );

    return results;
  }

  /**
   * Get inventory by medicine ID
   */
  async getInventoryByMedicineId(medicineId, userId) {
    const inventory = await prisma.inventory.findMany({
      where: {
        medicineId,
        userId
      },
      include: {
        medicine: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return inventory;
  }

  /**
   * Get inventory locations
   */
  async getInventoryLocations(userId) {
    const locations = await prisma.inventory.groupBy({
      by: ['location'],
      where: {
        userId,
        location: { not: null }
      },
      _count: { location: true }
    });

    return locations.map(loc => loc.location);
  }
}

module.exports = new InventoryService();

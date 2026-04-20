const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');
const notificationService = require('../notifications/services/notificationService');

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
        medicine: {
          select: {
            id: true,
            name: true,
            category: true,
            unitPrice: true,
            requiresPrescription: true
          }
        },
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
    const { 
      medicineId, 
      userId, 
      quantity, 
      batchNumber, 
      expiryDate, 
      purchasePrice, 
      location, 
      minStockLevel, 
      notes 
    } = inventoryData;

    // Verify medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId, isActive: true }
    });

    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
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

    // Check if this creates low stock situation
    if (quantity <= minStockLevel) {
      await notificationService.createInventoryNotification(userId, 'LOW_STOCK', {
        medicineId,
        medicineName: medicine.name,
        currentStock: quantity,
        minStockLevel
      });
    }

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

    // Check for low stock after update
    if (updateData.quantity !== undefined && updateData.quantity <= (updateData.minStockLevel || existingInventory.minStockLevel)) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: existingInventory.medicineId }
      });
      
      await notificationService.createInventoryNotification(existingInventory.userId, 'LOW_STOCK', {
        medicineId: existingInventory.medicineId,
        medicineName: medicine.name,
        currentStock: updateData.quantity,
        minStockLevel: updateData.minStockLevel || existingInventory.minStockLevel
      });
    }

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
  async adjustInventoryStock(id, quantity, reason, requestingUser) {
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

    // Check for low stock after adjustment
    if (quantity <= inventory.minStockLevel) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: inventory.medicineId }
      });
      
      await notificationService.createInventoryNotification(inventory.userId, 'LOW_STOCK', {
        medicineId: inventory.medicineId,
        medicineName: medicine.name,
        currentStock: quantity,
        minStockLevel: inventory.minStockLevel
      });
    }

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

  /**
   * Get stock adjustments history
   */
  async getStockAdjustments(inventoryId, requestingUser, filters = {}) {
    const { page = 1, limit = 10, startDate, endDate } = filters;
    const { skip, take } = getPagination(page, limit);

    // Check permissions
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    });

    if (!inventory) {
      throw new AppError('Inventory item not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && inventory.userId !== requestingUser.id) {
      throw new AppError('Access denied', 403);
    }

    const where = { inventoryId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        skip,
        take,
        include: {
          adjustedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockAdjustment.count({ where })
    ]);

    return {
      adjustments,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get inventory value by category
   */
  async getInventoryValueByCategory(userId) {
    const inventory = await prisma.inventory.findMany({
      where: { userId },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            category: true,
            unitPrice: true
          }
        }
      }
    });

    const valueByCategory = inventory.reduce((acc, item) => {
      const category = item.medicine.category;
      const value = item.quantity * item.medicine.unitPrice;
      
      if (!acc[category]) {
        acc[category] = {
          category,
          totalQuantity: 0,
          totalValue: 0,
          itemCount: 0
        };
      }
      
      acc[category].totalQuantity += item.quantity;
      acc[category].totalValue += value;
      acc[category].itemCount += 1;
      
      return acc;
    }, {});

    return Object.values(valueByCategory);
  }

  /**
   * Get expired items
   */
  async getExpiredItems(userId) {
    const items = await prisma.inventory.findMany({
      where: {
        userId,
        expiryDate: { lte: new Date() }
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
   * Get inventory turnover
   */
  async getInventoryTurnover(userId, filters = {}) {
    const { startDate, endDate, period = 'month' } = filters;

    const where = {
      userId,
      stockAdjustments: {
        some: {
          createdAt: {}
        }
      }
    };

    if (startDate || endDate) {
      where.stockAdjustments.some.createdAt = {};
      if (startDate) {
        where.stockAdjustments.some.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.stockAdjustments.some.createdAt.lte = new Date(endDate);
      }
    }

    const adjustments = await prisma.stockAdjustment.findMany({
      where,
      include: {
        inventory: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by period
    const groupBy = this.getGroupByPeriod(period);
    const turnover = adjustments.reduce((acc, adj) => {
      const period = adj.createdAt.toISOString().slice(0, 7); // Weekly grouping
      if (!acc[period]) {
        acc[period] = {
          period,
          adjustmentsIn: 0,
          adjustmentsOut: 0,
          netChange: 0
        };
      }
      
      const change = adj.newQuantity - adj.previousQuantity;
      if (change > 0) {
        acc[period].adjustmentsIn += change;
      } else {
        acc[period].adjustmentsOut += Math.abs(change);
      }
      acc[period].netChange += change;
      
      return acc;
    }, {});

    return Object.values(turnover);
  }

  /**
   * Get group by period for queries
   */
  getGroupByPeriod(period) {
    switch (period) {
      case 'day':
        return ['createdAt'];
      case 'week':
        return ['createdAt'];
      case 'month':
        return ['createdAt'];
      case 'year':
        return ['createdAt'];
      default:
        return ['createdAt'];
    }
  }
}

module.exports = new InventoryService();

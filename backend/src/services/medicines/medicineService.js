const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');

class MedicineService {
  /**
   * Get all medicines with pagination and filtering
   */
  async getMedicines(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      form, 
      requiresPrescription,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = { isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (form) {
      where.form = form;
    }

    if (requiresPrescription !== undefined) {
      where.requiresPrescription = requiresPrescription;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.unitPrice = {};
      if (minPrice !== undefined) {
        where.unitPrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.unitPrice.lte = maxPrice;
      }
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.medicine.count({ where })
    ]);

    return {
      medicines,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get medicine by ID
   */
  async getMedicineById(id) {
    const medicine = await prisma.medicine.findUnique({
      where: { id, isActive: true },
      include: {
        inventory: {
          where: { quantity: { gt: 0 } },
          select: {
            quantity: true,
            location: true,
            expiryDate: true
          }
        }
      }
    });

    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    return medicine;
  }

  /**
   * Create medicine
   */
  async createMedicine(medicineData, createdBy) {
    const medicine = await prisma.medicine.create({
      data: {
        ...medicineData,
        createdBy
      }
    });

    return medicine;
  }

  /**
   * Update medicine
   */
  async updateMedicine(id, updateData, updatedBy) {
    // Check if medicine exists
    const existingMedicine = await prisma.medicine.findUnique({
      where: { id }
    });

    if (!existingMedicine) {
      throw new AppError('Medicine not found', 404);
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: updateData
    });

    return medicine;
  }

  /**
   * Delete medicine (soft delete)
   */
  async deleteMedicine(id) {
    await prisma.medicine.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Get low stock medicines
   */
  async getLowStockMedicines(userId) {
    const medicines = await prisma.medicine.findMany({
      where: {
        isActive: true,
        inventory: {
          some: {
            userId,
            quantity: { lte: prisma.inventory.fields.minStockLevel }
          }
        }
      },
      include: {
        inventory: {
          where: { userId },
          select: {
            quantity: true,
            minStockLevel: true,
            location: true
          }
        }
      }
    });

    return medicines;
  }

  /**
   * Get expiring medicines
   */
  async getExpiringMedicines(userId, days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const medicines = await prisma.medicine.findMany({
      where: {
        isActive: true,
        inventory: {
          some: {
            userId,
            expiryDate: { lte: expiryDate }
          }
        }
      },
      include: {
        inventory: {
          where: { userId },
          select: {
            quantity: true,
            expiryDate: true,
            location: true
          }
        }
      }
    });

    return medicines;
  }

  /**
   * Get medicine categories
   */
  async getMedicineCategories() {
    const categories = await prisma.medicine.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true }
    });

    return categories.map(cat => cat.category);
  }

  /**
   * Search medicines
   */
  async searchMedicines(filters = {}) {
    const { 
      query, 
      page = 1, 
      limit = 10,
      category,
      form,
      minPrice,
      maxPrice
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (category) {
      where.category = category;
    }

    if (form) {
      where.form = form;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.unitPrice = {};
      if (minPrice !== undefined) {
        where.unitPrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.unitPrice.lte = maxPrice;
      }
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      prisma.medicine.count({ where })
    ]);

    return {
      medicines,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get medicine by barcode
   */
  async getMedicineByBarcode(barcode) {
    const medicine = await prisma.medicine.findUnique({
      where: { barcode, isActive: true }
    });

    return medicine;
  }

  /**
   * Update medicine stock
   */
  async updateMedicineStock(medicineId, quantity, userId) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        medicineId,
        userId
      }
    });

    if (inventory) {
      return await prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantity }
      });
    }

    // Create new inventory item if not exists
    return await prisma.inventory.create({
      data: {
        medicineId,
        userId,
        quantity
      }
    });
  }

  /**
   * Get medicine statistics
   */
  async getMedicineStatistics(userId) {
    const [
      totalMedicines,
      lowStockCount,
      expiringCount,
      totalValue
    ] = await Promise.all([
      prisma.medicine.count({
        where: {
          isActive: true,
          inventory: {
            some: { userId }
          }
        }
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
      totalMedicines,
      lowStockCount,
      expiringCount,
      totalValue: totalValue._sum.quantity || 0
    };
  }
}

module.exports = new MedicineService();

const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');

class ReportService {
  /**
   * Get sales report
   */
  async getSalesReport(filters = {}) {
    const { startDate, endDate, period = 'month', userId, userRole } = filters;

    const where = {};
    
    // Role-based filtering
    if (userRole === 'PHARMACY') {
      where.customerId = userId;
    } else if (userRole === 'WHOLESALER') {
      where.supplierId = userId;
    }

    // Date filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Group by period
    const groupBy = this.getGroupByPeriod(period);

    const salesData = await prisma.order.groupBy({
      by: groupBy,
      where: {
        ...where,
        status: 'DELIVERED'
      },
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { [groupBy]: 'asc' }
    });

    return {
      period,
      data: salesData.map(item => ({
        period: item[groupBy],
        orders: item._count.id,
        revenue: item._sum.totalAmount || 0
      }))
    };
  }

  /**
   * Get inventory report
   */
  async getInventoryReport(filters = {}) {
    const { userId, includeExpiring, includeLowStock } = filters;

    const where = { userId };

    const inventory = await prisma.inventory.findMany({
      where,
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
      orderBy: { quantity: 'desc' }
    });

    let report = {
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.medicine.unitPrice), 0),
      categories: {},
      items: inventory
    };

    // Category breakdown
    inventory.forEach(item => {
      const category = item.medicine.category;
      if (!report.categories[category]) {
        report.categories[category] = {
          count: 0,
          value: 0
        };
      }
      report.categories[category].count++;
      report.categories[category].value += item.quantity * item.medicine.unitPrice;
    });

    // Expiring items
    if (includeExpiring) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      report.expiringItems = inventory.filter(item => 
        item.expiryDate && new Date(item.expiryDate) <= expiryDate
      );
    }

    // Low stock items
    if (includeLowStock) {
      report.lowStockItems = inventory.filter(item => 
        item.quantity <= (item.minStockLevel || 10)
      );
    }

    return report;
  }

  /**
   * Get financial report
   */
  async getFinancialReport(filters = {}) {
    const { startDate, endDate, period = 'month' } = filters;

    const where = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const groupBy = this.getGroupByPeriod(period);

    const [paymentData, orderData] = await Promise.all([
      prisma.payment.groupBy({
        by: groupBy,
        where: {
          ...where,
          status: 'COMPLETED'
        },
        _count: { id: true },
        _sum: { amount: true },
        orderBy: { [groupBy]: 'asc' }
      }),
      prisma.order.groupBy({
        by: groupBy,
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: { [groupBy]: 'asc' }
      })
    ]);

    return {
      period,
      payments: paymentData.map(item => ({
        period: item[groupBy],
        transactions: item._count.id,
        revenue: item._sum.amount || 0
      })),
      orders: orderData.map(item => ({
        period: item[groupBy],
        orders: item._count.id,
        totalValue: item._sum.totalAmount || 0
      }))
    };
  }

  /**
   * Get user activity report
   */
  async getUserActivityReport(filters = {}) {
    const { startDate, endDate, userId } = filters;

    const where = {};
    
    if (userId) {
      where.id = userId;
    }

    if (startDate || endDate) {
      where.lastLoginAt = {};
      if (startDate) {
        where.lastLoginAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.lastLoginAt.lte = new Date(endDate);
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            payments: true,
            messages: {
              where: { senderId: userId || undefined }
            }
          }
        }
      },
      orderBy: { lastLoginAt: 'desc' }
    });

    return {
      users: users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        memberSince: user.createdAt,
        orders: user._count.orders,
        payments: user._count.payments,
        messages: user._count.messages
      }))
    };
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(filters = {}) {
    const { startDate, endDate, period = 'month', userId, userRole } = filters;

    const where = {};
    
    // Role-based filtering
    if (userRole === 'PHARMACY') {
      where.customerId = userId;
    } else if (userRole === 'WHOLESALER') {
      where.supplierId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [statusBreakdown, orderTrends, topCustomers] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      prisma.order.groupBy({
        by: [this.getGroupByPeriod(period)],
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: { [this.getGroupByPeriod(period)]: 'asc' }
      }),
      userRole === 'WHOLESALER' ? prisma.order.groupBy({
        by: ['customerId'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 10
      }) : null
    ]);

    return {
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      trends: orderTrends.map(item => ({
        period: item[this.getGroupByPeriod(period)],
        orders: item._count.id,
        revenue: item._sum.totalAmount || 0
      })),
      topCustomers: topCustomers ? topCustomers.map(item => ({
        customerId: item.customerId,
        orders: item._count.id,
        revenue: item._sum.totalAmount || 0
      })) : []
    };
  }

  /**
   * Get medicine performance report
   */
  async getMedicinePerformanceReport(filters = {}) {
    const { startDate, endDate, userId, userRole } = filters;

    const where = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get medicine performance from order items
    const medicinePerformance = await prisma.orderItem.groupBy({
      by: ['medicineId'],
      where: {
        order: where
      },
      _count: { id: true },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 20
    });

    // Get medicine details
    const medicineIds = medicinePerformance.map(item => item.medicineId);
    const medicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
      select: {
        id: true,
        name: true,
        category: true,
        unitPrice: true
      }
    });

    const medicineMap = medicines.reduce((acc, med) => {
      acc[med.id] = med;
      return acc;
    }, {});

    return {
      topMedicines: medicinePerformance.map(item => ({
        medicine: medicineMap[item.medicineId],
        orders: item._count.id,
        quantitySold: item._sum.quantity || 0,
        revenue: item._sum.totalPrice || 0
      }))
    };
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(filters = {}) {
    const { userId, userRole } = filters;

    const where = {};
    
    // Role-based filtering
    if (userRole === 'PHARMACY') {
      where.customerId = userId;
    } else if (userRole === 'WHOLESALER') {
      where.supplierId = userId;
    }

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      unreadMessages,
      lowStockItems
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: 'DELIVERED' },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { ...where, status: 'PENDING' }
      }),
      prisma.message.count({
        where: { receiverId: userId, isRead: false }
      }),
      userRole === 'PHARMACY' ? prisma.inventory.count({
        where: {
          userId,
          quantity: { lte: prisma.inventory.fields.minStockLevel }
        }
      }) : 0
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      unreadMessages,
      lowStockItems
    };
  }

  /**
   * Export report to CSV
   */
  async exportReport(filters = {}) {
    const { reportType, filters: reportFilters, format, userId, userRole } = filters;

    let data;
    
    switch (reportType) {
      case 'sales':
        data = await this.getSalesReport({ ...reportFilters, userId, userRole });
        break;
      case 'inventory':
        data = await this.getInventoryReport({ ...reportFilters, userId });
        break;
      case 'orders':
        data = await this.getOrderAnalytics({ ...reportFilters, userId, userRole });
        break;
      default:
        throw new AppError('Invalid report type', 400);
    }

    // Convert to CSV
    return this.convertToCSV(data, reportType);
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

  /**
   * Convert data to CSV format
   */
  convertToCSV(data, reportType) {
    const headers = this.getCSVHeaders(reportType);
    const rows = this.getCSVRows(data, reportType);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Get CSV headers based on report type
   */
  getCSVHeaders(reportType) {
    switch (reportType) {
      case 'sales':
        return ['Period', 'Orders', 'Revenue'];
      case 'inventory':
        return ['Medicine Name', 'Category', 'Quantity', 'Unit Price', 'Total Value'];
      case 'orders':
        return ['Period', 'Orders', 'Revenue'];
      default:
        return [];
    }
  }

  /**
   * Get CSV rows based on report type
   */
  getCSVRows(data, reportType) {
    switch (reportType) {
      case 'sales':
        return data.data.map(item => [
          item.period,
          item.orders,
          item.revenue
        ]);
      case 'inventory':
        return data.items.map(item => [
          item.medicine.name,
          item.medicine.category,
          item.quantity,
          item.medicine.unitPrice,
          item.quantity * item.medicine.unitPrice
        ]);
      case 'orders':
        return data.trends.map(item => [
          item.period,
          item.orders,
          item.revenue
        ]);
      default:
        return [];
    }
  }
}

module.exports = new ReportService();

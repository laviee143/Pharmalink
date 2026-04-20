const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');

class PaymentService {
  /**
   * Get all payments with pagination and filtering
   */
  async getPayments(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      method, 
      orderId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
      userRole
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = {};
    
    // Role-based filtering
    if (userRole === 'PHARMACY') {
      where.userId = userId;
    } else if (userRole === 'WHOLESALER') {
      where.order = {
        supplierId: userId
      };
    }

    // Additional filters
    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (orderId) {
      where.orderId = orderId;
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

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.payment.count({ where })
    ]);

    return {
      payments,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id, requestingUser) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            supplier: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            items: {
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
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check permissions
    if (requestingUser.role !== 'ADMIN' && 
        requestingUser.id !== payment.userId && 
        requestingUser.id !== payment.order?.customerId && 
        requestingUser.id !== payment.order?.supplierId) {
      throw new AppError('Access denied', 403);
    }

    return payment;
  }

  /**
   * Create payment
   */
  async createPayment(paymentData) {
    const { orderId, amount, currency = 'USD', method, transactionId, notes } = paymentData;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: paymentData.userId,
        amount,
        currency,
        method,
        status: 'PENDING',
        transactionId,
        notes
      },
      include: {
        order: true
      }
    });

    return payment;
  }

  /**
   * Update payment
   */
  async updatePayment(id, updateData) {
    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        order: true
      }
    });

    return payment;
  }

  /**
   * Process payment
   */
  async processPayment(paymentData) {
    const { orderId, method, amount, currency = 'USD', userId } = paymentData;

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        customerId: userId
      }
    });

    if (!order) {
      throw new AppError('Order not found or access denied', 404);
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount,
        currency,
        method,
        status: 'PROCESSING',
        transactionId: `TXN${Date.now().toString().slice(-6)}`
      }
    });

    // Simulate payment processing (in real implementation, integrate with payment gateway)
    setTimeout(async () => {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          gatewayResponse: JSON.stringify({ status: 'success', transactionId: payment.transactionId })
        }
      });
    }, 2000);

    return payment;
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentId, gatewayResponse, requestingUser) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check permissions
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== payment.userId) {
      throw new AppError('Access denied', 403);
    }

    const response = JSON.parse(gatewayResponse);
    const status = response.status === 'success' ? 'COMPLETED' : 'FAILED';

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        gatewayResponse
      }
    });

    return updatedPayment;
  }

  /**
   * Refund payment
   */
  async refundPayment(id, amount, reason, requestingUser) {
    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'COMPLETED') {
      throw new AppError('Payment cannot be refunded', 400);
    }

    if (requestingUser.role !== 'ADMIN') {
      throw new AppError('Access denied', 403);
    }

    const refundAmount = amount || payment.amount;
    const refundStatus = refundAmount < payment.amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED';

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: refundStatus,
        notes: `${payment.notes || ''}\n\nRefund: ${reason} - Amount: $${refundAmount}`
      }
    });

    return updatedPayment;
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    return [
      'CREDIT_CARD',
      'DEBIT_CARD',
      'BANK_TRANSFER',
      'CASH_ON_DELIVERY',
      'DIGITAL_WALLET'
    ];
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(filters = {}) {
    const { startDate, endDate, period = 'month', userId, userRole } = filters;

    const where = {};
    
    // Role-based filtering
    if (userRole === 'PHARMACY') {
      where.userId = userId;
    } else if (userRole === 'WHOLESALER') {
      where.order = {
        supplierId: userId
      };
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

    const [
      totalPayments,
      totalRevenue,
      paymentsByMethod,
      paymentsByStatus,
      averagePaymentAmount
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where,
        _count: { method: true },
        _sum: { amount: true }
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _avg: { amount: true }
      })
    ]);

    return {
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      paymentsByMethod: paymentsByMethod.reduce((acc, item) => {
        acc[item.method] = {
          count: item._count.method,
          total: item._sum.amount || 0
        };
        return acc;
      }, {}),
      paymentsByStatus: paymentsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      averagePaymentAmount: averagePaymentAmount._avg.amount || 0
    };
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      startDate,
      endDate,
      orderId,
      userId
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    return {
      payments,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Create invoice
   */
  async createInvoice(invoiceData) {
    const { orderId, items, notes, userId } = invoiceData;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        userId,
        invoiceNumber: `INV${Date.now().toString().slice(-6)}`,
        status: 'PENDING',
        subtotal: order.subtotal,
        tax: order.tax,
        totalAmount: order.totalAmount,
        currency: order.currency,
        notes,
        items: {
          create: items
        }
      },
      include: {
        order: true,
        items: true
      }
    });

    return invoice;
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id, requestingUser) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                address: true
              }
            },
            supplier: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            items: {
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
      throw new AppError('Invoice not found', 404);
    }

    // Check permissions
    if (requestingUser.role !== 'ADMIN' && 
        requestingUser.id !== invoice.userId && 
        requestingUser.id !== invoice.order?.customerId && 
        requestingUser.id !== invoice.order?.supplierId) {
      throw new AppError('Access denied', 403);
    }

    return invoice;
  }
}

module.exports = new PaymentService();

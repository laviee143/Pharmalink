const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');
const notificationService = require('../notifications/services/notificationService');

class OrderService {
  /**
   * Get all orders with pagination and filtering
   */
  async getOrders(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      customerId, 
      supplierId,
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
      where.customerId = userId;
    } else if (userRole === 'WHOLESALER') {
      where.supplierId = userId;
    }

    // Additional filters
    if (status) {
      where.status = status;
    }

    if (userRole === 'ADMIN') {
      if (customerId) {
        where.customerId = customerId;
      }
      if (supplierId) {
        where.supplierId = supplierId;
      }
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

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
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
                  category: true,
                  unitPrice: true,
                  requiresPrescription: true
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(id, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id },
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
                unitPrice: true,
                requiresPrescription: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            createdAt: true
          }
        }
      }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check permissions
    if (requestingUser.role !== 'ADMIN' && 
        requestingUser.id !== order.customerId && 
        requestingUser.id !== order.supplierId) {
      throw new AppError('Access denied', 403);
    }

    return order;
  }

  /**
   * Create order
   */
  async createOrder(orderData) {
    const { 
      customerId, 
      supplierId, 
      items, 
      shippingAddress, 
      deliveryInstructions, 
      notes 
    } = orderData;

    // Generate order number
    const orderNumber = `ORD${Date.now().toString().slice(-6)}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      return {
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        batchNumber: item.batchNumber,
        notes: item.notes
      };
    });

    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = 10; // Fixed shipping cost
    const totalAmount = subtotal + tax + shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        supplierId,
        status: 'PENDING',
        subtotal,
        tax,
        shippingCost,
        totalAmount,
        currency: 'USD',
        shippingAddress,
        deliveryInstructions,
        notes,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            medicine: true
          }
        }
      }
    });

    // Create notification for supplier
    await notificationService.createOrderNotification(order.id, 'ORDER_CREATED', supplierId);

    return order;
  }

  /**
   * Update order
   */
  async updateOrder(id, updateData, requestingUser) {
    // Check if order exists and user has permission
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      throw new AppError('Order not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && 
        requestingUser.id !== existingOrder.customerId && 
        requestingUser.id !== existingOrder.supplierId) {
      throw new AppError('Access denied', 403);
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            medicine: true
          }
        }
      }
    });

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(id, reason, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      throw new AppError('Order cannot be cancelled', 400);
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== order.customerId) {
      throw new AppError('Access denied', 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${order.notes || ''}\n\nCancellation: ${reason}` : order.notes
      }
    });

    // Create notification
    await notificationService.createOrderNotification(id, 'ORDER_CANCELLED', order.supplierId);

    return updatedOrder;
  }

  /**
   * Confirm order
   */
  async confirmOrder(id, estimatedDeliveryDate, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Order cannot be confirmed', 400);
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== order.supplierId) {
      throw new AppError('Access denied', 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        estimatedDeliveryDate
      }
    });

    // Create notification
    await notificationService.createOrderNotification(id, 'ORDER_CONFIRMED', order.customerId);

    return updatedOrder;
  }

  /**
   * Ship order
   */
  async shipOrder(id, trackingNumber, estimatedDeliveryDate, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'CONFIRMED' && order.status !== 'PROCESSING') {
      throw new AppError('Order cannot be shipped', 400);
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== order.supplierId) {
      throw new AppError('Access denied', 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'SHIPPED',
        trackingNumber,
        estimatedDeliveryDate
      }
    });

    // Create notification
    await notificationService.createOrderNotification(id, 'ORDER_SHIPPED', order.customerId);

    return updatedOrder;
  }

  /**
   * Deliver order
   */
  async deliverOrder(id, deliveryNotes, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'SHIPPED') {
      throw new AppError('Order cannot be delivered', 400);
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== order.supplierId) {
      throw new AppError('Access denied', 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        actualDeliveryDate: new Date(),
        notes: deliveryNotes
      }
    });

    // Create notification
    await notificationService.createOrderNotification(id, 'ORDER_DELIVERED', order.customerId);

    return updatedOrder;
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(filters = {}) {
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

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      averageOrderValue
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: 'DELIVERED' },
        _sum: { totalAmount: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { ...where, status: 'DELIVERED' },
        _avg: { totalAmount: true }
      })
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: item._count.status,
          revenue: item._sum.totalAmount || 0
        };
        return acc;
      }, {}),
      averageOrderValue: averageOrderValue._avg.totalAmount || 0
    };
  }

  /**
   * Get order items
   */
  async getOrderItems(orderId, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && 
        requestingUser.id !== order.customerId && 
        requestingUser.id !== order.supplierId) {
      throw new AppError('Access denied', 403);
    }

    const items = await prisma.orderItem.findMany({
      where: { orderId },
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
      orderBy: { createdAt: 'asc' }
    });

    return items;
  }

  /**
   * Add order item
   */
  async addOrderItem(orderId, itemData, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Order items cannot be added', 400);
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== order.customerId) {
      throw new AppError('Access denied', 403);
    }

    const { medicineId, quantity, unitPrice, batchNumber, notes } = itemData;
    const totalPrice = quantity * unitPrice;

    const item = await prisma.orderItem.create({
      data: {
        orderId,
        medicineId,
        quantity,
        unitPrice,
        totalPrice,
        batchNumber,
        notes
      },
      include: {
        medicine: true
      }
    });

    // Update order totals
    await this.updateOrderTotals(orderId);

    return item;
  }

  /**
   * Update order item
   */
  async updateOrderItem(orderId, itemId, updateData, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== order.supplierId) {
      throw new AppError('Access denied', 403);
    }

    const { quantity, unitPrice, notes } = updateData;
    const totalPrice = quantity * unitPrice;

    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        quantity,
        unitPrice,
        totalPrice,
        notes
      },
      include: {
        medicine: true
      }
    });

    // Update order totals
    await this.updateOrderTotals(orderId);

    return item;
  }

  /**
   * Delete order item
   */
  async deleteOrderItem(orderId, itemId, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Order items cannot be deleted', 400);
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== order.customerId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.orderItem.delete({
      where: { id: itemId }
    });

    // Update order totals
    await this.updateOrderTotals(orderId);
  }

  /**
   * Update order totals
   */
  async updateOrderTotals(orderId) {
    const items = await prisma.orderItem.findMany({
      where: { orderId }
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.1;
    const shippingCost = 10;
    const totalAmount = subtotal + tax + shippingCost;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal,
        tax,
        shippingCost,
        totalAmount
      }
    });
  }

  /**
   * Get order by status
   */
  async getOrdersByStatus(status, filters = {}) {
    const { page = 1, limit = 10, userId, userRole } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = { status };
    
    // Role-based filtering
    if (userRole === 'PHARMACY') {
      where.customerId = userId;
    } else if (userRole === 'WHOLESALER') {
      where.supplierId = userId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
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
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get order timeline
   */
  async getOrderTimeline(orderId, requestingUser) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' && 
        requestingUser.id !== order.customerId && 
        requestingUser.id !== order.supplierId) {
      throw new AppError('Access denied', 403);
    }

    const timeline = [
      {
        status: 'PENDING',
        timestamp: order.createdAt,
        description: 'Order created and awaiting confirmation'
      }
    ];

    if (order.estimatedDeliveryDate) {
      timeline.push({
        status: 'CONFIRMED',
        timestamp: order.updatedAt,
        description: 'Order confirmed by supplier'
      });
    }

    if (order.trackingNumber) {
      timeline.push({
        status: 'SHIPPED',
        timestamp: order.updatedAt,
        description: `Order shipped with tracking number: ${order.trackingNumber}`
      });
    }

    if (order.actualDeliveryDate) {
      timeline.push({
        status: 'DELIVERED',
        timestamp: order.actualDeliveryDate,
        description: 'Order delivered successfully'
      });
    }

    if (order.status === 'CANCELLED') {
      timeline.push({
        status: 'CANCELLED',
        timestamp: order.updatedAt,
        description: 'Order was cancelled'
      });
    }

    return timeline;
  }
}

module.exports = new OrderService();

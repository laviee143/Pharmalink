const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');
const emailConfig = require('../../config/email');
const redisConfig = require('../../config/redis');

class NotificationService {
  /**
   * Get all notifications with pagination and filtering
   */
  async getNotifications(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      unread,
      channels,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = { userId };
    
    if (type) {
      where.type = type;
    }

    if (unread !== undefined) {
      where.isRead = unread === 'true' ? false : true;
    }

    if (channels && channels.length > 0) {
      where.channels = {
        hasEvery: channels
      };
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id, requestingUser) {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check permissions - users can only view their own notifications
    if (requestingUser.id !== notification.userId) {
      throw new AppError('Access denied', 403);
    }

    return notification;
  }

  /**
   * Create notification
   */
  async createNotification(notificationData) {
    const { userId, type, title, message, channels = ['IN_APP'], data } = notificationData;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check user preferences
    const preferences = await this.getNotificationPreferences(userId);
    
    // Filter channels based on user preferences
    const enabledChannels = channels.filter(channel => {
      switch (channel) {
        case 'EMAIL':
          return preferences.emailNotifications;
        case 'SMS':
          return preferences.smsNotifications;
        case 'PUSH':
          return preferences.pushNotifications;
        case 'IN_APP':
          return preferences.inAppNotifications;
        default:
          return true;
      }
    });

    if (enabledChannels.length === 0) {
      return null; // User has disabled all notifications
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        channels: enabledChannels,
        data
      }
    });

    // Send notifications through enabled channels
    await this.sendNotificationChannels(notification, user, enabledChannels);

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id, requestingUser) {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check permissions
    if (requestingUser.id !== notification.userId) {
      throw new AppError('Access denied', 403);
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });

    return updatedNotification;
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds, requestingUser) {
    // Verify all notifications belong to the user
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: notificationIds },
        userId: requestingUser.id
      }
    });

    if (notifications.length !== notificationIds.length) {
      throw new AppError('Some notifications not found or access denied', 403);
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: requestingUser.id
      },
      data: { isRead: true, readAt: new Date() }
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(id, requestingUser) {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check permissions
    if (requestingUser.id !== notification.userId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.notification.delete({
      where: { id }
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return count;
  }

  /**
   * Get notification types
   */
  async getNotificationTypes() {
    return [
      'ORDER_CREATED',
      'ORDER_CONFIRMED',
      'ORDER_SHIPPED',
      'ORDER_DELIVERED',
      'ORDER_CANCELLED',
      'PAYMENT_RECEIVED',
      'PAYMENT_FAILED',
      'LOW_STOCK',
      'EXPIRING_SOON',
      'NEW_MESSAGE',
      'SYSTEM_UPDATE',
      'SECURITY_ALERT',
      'MAINTENANCE_SCHEDULED'
    ];
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(userId) {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Create default preferences
      return await prisma.notificationPreference.create({
        data: {
          userId,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          inAppNotifications: true,
          orderNotifications: true,
          paymentNotifications: true,
          messageNotifications: true,
          systemNotifications: true
        }
      });
    }

    return preferences;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    const updatedPreferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });

    return updatedPreferences;
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(bulkNotifications) {
    const results = await prisma.notification.createMany({
      data: bulkNotifications
    });

    // Send notifications asynchronously
    bulkNotifications.forEach(async (notification) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: notification.userId }
        });
        
        if (user) {
          await this.sendNotificationChannels(notification, user, notification.channels);
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    });

    return {
      count: results.count,
      message: 'Bulk notifications sent successfully'
    };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStatistics(filters = {}) {
    const { startDate, endDate, period = 'month', userId } = filters;

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

    const [
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByChannel
    ] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { ...where, isRead: false } 
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      }),
      prisma.notification.groupBy({
        by: ['channels'],
        where,
        _count: { channels: true }
      })
    ]);

    return {
      totalNotifications,
      unreadNotifications,
      notificationsByType: notificationsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      notificationsByChannel: notificationsByChannel.reduce((acc, item) => {
        item.channels.forEach(channel => {
          acc[channel] = (acc[channel] || 0) + item._count.channels;
        });
        return acc;
      }, {})
    };
  }

  /**
   * Test notification
   */
  async testNotification(testData) {
    const { type, userId, message, sentBy } = testData;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title: 'Test Notification',
        message: message || 'This is a test notification',
        channels: ['IN_APP'],
        data: {
          isTest: true,
          sentBy
        }
      }
    });

    return notification;
  }

  /**
   * Create order notification
   */
  async createOrderNotification(orderId, type, userId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        supplier: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const notificationMessages = {
      ORDER_CREATED: 'Your order has been created successfully',
      ORDER_CONFIRMED: 'Your order has been confirmed',
      ORDER_SHIPPED: 'Your order has been shipped',
      ORDER_DELIVERED: 'Your order has been delivered',
      ORDER_CANCELLED: 'Your order has been cancelled'
    };

    await this.createNotification({
      userId,
      type,
      title: `Order ${type.replace('_', ' ')}`,
      message: notificationMessages[type] || `Your order status has been updated to: ${type}`,
      channels: ['IN_APP', 'EMAIL'],
      data: {
        orderId,
        orderNumber: order.orderNumber
      }
    });
  }

  /**
   * Create payment notification
   */
  async createPaymentNotification(paymentId, type, userId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true
          }
        }
      }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    const notificationMessages = {
      PAYMENT_RECEIVED: 'Your payment has been received',
      PAYMENT_FAILED: 'Your payment has failed',
      PAYMENT_REFUNDED: 'Your payment has been refunded'
    };

    await this.createNotification({
      userId,
      type,
      title: `Payment ${type.replace('_', ' ')}`,
      message: notificationMessages[type] || `Your payment status has been updated to: ${type}`,
      channels: ['IN_APP', 'EMAIL'],
      data: {
        paymentId,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        amount: payment.amount
      }
    });
  }

  /**
   * Create inventory notification
   */
  async createInventoryNotification(userId, type, data) {
    const notificationMessages = {
      LOW_STOCK: 'Some medicines are running low on stock',
      EXPIRING_SOON: 'Some medicines are expiring soon'
    };

    await this.createNotification({
      userId,
      type,
      title: 'Inventory Alert',
      message: notificationMessages[type] || 'Inventory alert',
      channels: ['IN_APP', 'EMAIL'],
      data
    });
  }

  /**
   * Send notifications through different channels
   */
  async sendNotificationChannels(notification, user, channels) {
    const promises = [];

    if (channels.includes('EMAIL')) {
      promises.push(this.sendEmailNotification(user, notification));
    }

    if (channels.includes('SMS')) {
      promises.push(this.sendSMSNotification(user, notification));
    }

    if (channels.includes('PUSH')) {
      promises.push(this.sendPushNotification(user, notification));
    }

    if (channels.includes('IN_APP')) {
      promises.push(this.sendInAppNotification(user, notification));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(user, notification) {
    try {
      await emailConfig.sendSystemNotificationEmail(
        user.email,
        notification.title,
        notification.message
      );
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMSNotification(user, notification) {
    // Implementation would depend on SMS service provider
    console.log(`SMS notification sent to ${user.phone}: ${notification.message}`);
  }

  /**
   * Send push notification
   */
  async sendPushNotification(user, notification) {
    // Implementation would depend on push notification service
    console.log(`Push notification sent to ${user.id}: ${notification.message}`);
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(user, notification) {
    // In-app notifications are stored in database and retrieved via API
    // This is handled by the createNotification method
    console.log(`In-app notification created for ${user.id}: ${notification.message}`);
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(notificationData, scheduledAt) {
    const notification = await prisma.notification.create({
      data: {
        ...notificationData,
        scheduledAt
      }
    });

    return notification;
  }

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications(userId) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        scheduledAt: {
          gte: new Date()
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    return notifications;
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(id, requestingUser) {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (requestingUser.id !== notification.userId) {
      throw new AppError('Access denied', 403);
    }

    if (!notification.scheduledAt) {
      throw new AppError('Notification is not scheduled', 400);
    }

    await prisma.notification.delete({
      where: { id }
    });
  }
}

module.exports = new NotificationService();

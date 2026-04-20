const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/errors');
const { getPagination, formatPagination } = require('../../utils/helpers');

class MessageService {
  /**
   * Get all messages with pagination and filtering
   */
  async getMessages(filters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      userId, 
      orderId, 
      unread,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      currentUserId
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = {};
    
    // Filter messages where current user is either sender or receiver
    where.OR = [
      { senderId: currentUserId },
      { receiverId: currentUserId }
    ];

    // Additional filters
    if (userId) {
      where.OR = [
        { AND: [{ senderId: currentUserId }, { receiverId: userId }] },
        { AND: [{ senderId: userId }, { receiverId: currentUserId }] }
      ];
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (unread !== undefined) {
      where.isRead = unread === 'true' ? false : true;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true
            }
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              fileSize: true,
              filePath: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.message.count({ where })
    ]);

    return {
      messages,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get message by ID
   */
  async getMessageById(id, requestingUser) {
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            filePath: true
          }
        }
      }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check permissions - users can only view messages where they are sender or receiver
    if (requestingUser.id !== message.senderId && requestingUser.id !== message.receiverId) {
      throw new AppError('Access denied', 403);
    }

    return message;
  }

  /**
   * Send message
   */
  async sendMessage(messageData) {
    const { receiverId, orderId, type, content, attachments, senderId } = messageData;

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId, isActive: true }
    });

    if (!receiver) {
      throw new AppError('Receiver not found', 404);
    }

    // Verify order exists if provided
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user has permission to send message about this order
      if (senderId !== order.customerId && senderId !== order.supplierId) {
        throw new AppError('Access denied', 403);
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        orderId,
        type,
        content,
        attachments: attachments ? {
          create: attachments
        } : undefined
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        attachments: true
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `You have a new message from ${message.sender.firstName} ${message.sender.lastName}`,
        channels: ['IN_APP'],
        data: {
          messageId: message.id,
          senderName: `${message.sender.firstName} ${message.sender.lastName}`
        }
      }
    });

    return message;
  }

  /**
   * Reply to message
   */
  async replyToMessage(parentMessageId, replyData) {
    const { content, attachments, senderId } = replyData;

    const parentMessage = await prisma.message.findUnique({
      where: { id: parentMessageId }
    });

    if (!parentMessage) {
      throw new AppError('Parent message not found', 404);
    }

    // Determine receiver (the other person in the conversation)
    const receiverId = parentMessage.senderId === senderId ? parentMessage.receiverId : parentMessage.senderId;

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        orderId: parentMessage.orderId,
        type: 'TEXT',
        content,
        attachments: attachments ? {
          create: attachments
        } : undefined,
        parentMessageId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        attachments: true
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `You have a new reply from ${message.sender.firstName} ${message.sender.lastName}`,
        channels: ['IN_APP'],
        data: {
          messageId: message.id,
          senderName: `${message.sender.firstName} ${message.sender.lastName}`
        }
      }
    });

    return message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(id, requestingUser) {
    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check permissions - only receiver can mark as read
    if (requestingUser.id !== message.receiverId) {
      throw new AppError('Access denied', 403);
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });

    return updatedMessage;
  }

  /**
   * Mark multiple messages as read
   */
  async markMultipleAsRead(messageIds, requestingUser) {
    // Verify all messages belong to the user as receiver
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
        receiverId: requestingUser.id
      }
    });

    if (messages.length !== messageIds.length) {
      throw new AppError('Some messages not found or access denied', 403);
    }

    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: requestingUser.id
      },
      data: { isRead: true, readAt: new Date() }
    });
  }

  /**
   * Delete message
   */
  async deleteMessage(id, requestingUser) {
    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check permissions - only sender can delete their own messages
    if (requestingUser.id !== message.senderId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.message.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }

  /**
   * Get conversation
   */
  async getConversation(filters = {}) {
    const { userId1, userId2, page = 1, limit = 10 } = filters;
    const { skip, take } = getPagination(page, limit);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: userId1 }, { receiverId: userId2 }] },
          { AND: [{ senderId: userId2 }, { receiverId: userId1 }] }
        ],
        isDeleted: false
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            filePath: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take
    });

    return {
      messages,
      pagination: formatPagination(page, limit, messages.length)
    };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
        isDeleted: false
      }
    });

    return count;
  }

  /**
   * Search messages
   */
  async searchMessages(filters = {}) {
    const { 
      query, 
      page = 1, 
      limit = 10,
      userId,
      orderId
    } = filters;
    const { skip, take } = getPagination(page, limit);

    const where = {
      OR: [
        { AND: [{ senderId: userId }, { receiverId: userId }] },
        { AND: [{ senderId: userId }, { receiverId: userId }] }
      ],
      isDeleted: false,
      content: { contains: query, mode: 'insensitive' }
    };

    if (orderId) {
      where.orderId = orderId;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              fileSize: true,
              filePath: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.message.count({ where })
    ]);

    return {
      messages,
      pagination: formatPagination(page, limit, total)
    };
  }

  /**
   * Get message attachments
   */
  async getMessageAttachments(id, requestingUser) {
    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check permissions
    if (requestingUser.id !== message.senderId && requestingUser.id !== message.receiverId) {
      throw new AppError('Access denied', 403);
    }

    const attachments = await prisma.messageAttachment.findMany({
      where: { messageId: id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        filePath: true,
        createdAt: true
      }
    });

    return attachments;
  }

  /**
   * Download attachment
   */
  async downloadAttachment(id, requestingUser) {
    const attachment = await prisma.messageAttachment.findUnique({
      where: { id },
      include: {
        message: {
          select: {
            senderId: true,
            receiverId: true
          }
        }
      }
    });

    if (!attachment) {
      return null;
    }

    // Check permissions
    if (requestingUser.id !== attachment.message.senderId && 
        requestingUser.id !== attachment.message.receiverId) {
      throw new AppError('Access denied', 403);
    }

    return attachment;
  }

  /**
   * Get message threads
   */
  async getMessageThreads(filters = {}) {
    const { userId, page = 1, limit = 10 } = filters;
    const { skip, take } = getPagination(page, limit);

    // Get unique conversation partners
    const conversations = await prisma.message.groupBy({
      by: ['senderId', 'receiverId'],
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        isDeleted: false
      },
      _count: {
        id: true
      },
      _max: {
        createdAt: true
      },
      orderBy: {
        _max: {
          createdAt: 'desc'
        }
      },
      skip,
      take
    });

    const threads = await Promise.all(
      conversations.map(async (conv) => {
        const partnerId = conv.senderId === userId ? conv.receiverId : conv.senderId;
        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        });

        return {
          partner,
          lastMessageAt: conv._max.createdAt,
          unreadCount: await prisma.message.count({
            where: {
              senderId: partnerId,
              receiverId: userId,
              isRead: false,
              isDeleted: false
            }
          })
        };
      })
    );

    return {
      threads,
      pagination: formatPagination(page, limit, threads.length)
    };
  }
}

module.exports = new MessageService();

const nodemailer = require('nodemailer');
const logger = require('../middlewares/logger');
const { AppError } = require('../utils/errors');

class EmailConfig {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  /**
   * Initialize email transporter
   */
  async initialize() {
    try {
      const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };

      // Validate required configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn('Email configuration incomplete - email functionality disabled');
        return;
      }

      this.transporter = nodemailer.createTransporter(config);

      // Verify connection
      await this.transporter.verify();
      this.isConfigured = true;
      logger.info('Email transporter initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options) {
    if (!this.isConfigured) {
      logger.warn('Email not configured - skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', result.messageId);
      return true;

    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const html = `
      <h1>Welcome to PharmaLink!</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Welcome to PharmaLink - your trusted B2B platform for pharmacy and wholesaler connections.</p>
      <p>Your account has been successfully created with the email: ${user.email}</p>
      <p>Please verify your email address to activate your account.</p>
      <p>Thank you for choosing PharmaLink!</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to PharmaLink',
      html,
      text: `Welcome to PharmaLink! Your account has been created successfully. Please verify your email address.`
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <h1>Email Verification</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email Address</a></p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html,
      text: `Please verify your email address: ${verificationUrl}`
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <h1>Password Reset</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>You requested to reset your password. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html,
      text: `Reset your password: ${resetUrl}`
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(order) {
    const html = `
      <h1>Order Confirmation</h1>
      <p>Dear ${order.customer.firstName} ${order.customer.lastName},</p>
      <p>Your order has been confirmed successfully!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
      <p>You can track your order status in your dashboard.</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
      text: `Your order ${order.orderNumber} has been confirmed. Total: $${order.totalAmount.toFixed(2)}`
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdateEmail(order, newStatus) {
    const statusMessages = {
      CONFIRMED: 'Your order has been confirmed and is being processed.',
      SHIPPED: 'Your order has been shipped and is on its way!',
      DELIVERED: 'Your order has been delivered successfully.',
      CANCELLED: 'Your order has been cancelled.'
    };

    const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;
    
    const html = `
      <h1>Order Status Update</h1>
      <p>Dear ${order.customer.firstName} ${order.customer.lastName},</p>
      <p>${message}</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Status:</strong> ${newStatus}</p>
      ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: order.customer.email,
      subject: `Order Status Update - ${order.orderNumber}`,
      html,
      text: `Order ${order.orderNumber} status: ${newStatus}. ${message}`
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(payment) {
    const html = `
      <h1>Payment Confirmation</h1>
      <p>Dear ${payment.user.firstName} ${payment.user.lastName},</p>
      <p>Your payment has been processed successfully!</p>
      <p><strong>Payment ID:</strong> ${payment.id}</p>
      <p><strong>Amount:</strong> $${payment.amount.toFixed(2)}</p>
      <p><strong>Method:</strong> ${payment.method}</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: payment.user.email,
      subject: `Payment Confirmation - ${payment.id}`,
      html,
      text: `Your payment of $${payment.amount.toFixed(2)} has been processed successfully.`
    });
  }

  /**
   * Send low stock alert email
   */
  async sendLowStockAlertEmail(user, medicines) {
    const medicineList = medicines.map(med => 
      `<li>${med.name} - Current Stock: ${med.inventory[0]?.quantity || 0}</li>`
    ).join('');

    const html = `
      <h1>Low Stock Alert</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>The following medicines are running low on stock:</p>
      <ul>${medicineList}</ul>
      <p>Please restock these items to avoid any disruptions.</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Low Stock Alert',
      html,
      text: 'Some medicines are running low on stock. Please check your inventory.'
    });
  }

  /**
   * Send expiring medicines alert email
   */
  async sendExpiringMedicinesAlertEmail(user, medicines) {
    const medicineList = medicines.map(med => 
      `<li>${med.name} - Expires: ${med.inventory[0]?.expiryDate || 'N/A'}</li>`
    ).join('');

    const html = `
      <h1>Expiring Medicines Alert</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>The following medicines are expiring soon:</p>
      <ul>${medicineList}</ul>
      <p>Please take appropriate action to manage these expiring items.</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Expiring Medicines Alert',
      html,
      text: 'Some medicines are expiring soon. Please check your inventory.'
    });
  }

  /**
   * Send new message notification email
   */
  async sendNewMessageNotificationEmail(user, message) {
    const html = `
      <h1>New Message</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>You have received a new message from ${message.sender.firstName} ${message.sender.lastName}:</p>
      <p><em>${message.content}</em></p>
      <p>Check your dashboard to view and reply to this message.</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'New Message Received',
      html,
      text: `New message from ${message.sender.firstName} ${message.sender.lastName}: ${message.content}`
    });
  }

  /**
   * Send system notification email
   */
  async sendSystemNotificationEmail(user, title, message) {
    const html = `
      <h1>${title}</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>${message}</p>
      <p>Best regards,<br/>The PharmaLink Team</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: title,
      html,
      text: message
    });
  }

  /**
   * Check if email is configured
   */
  isEmailConfigured() {
    return this.isConfigured;
  }
}

// Create singleton instance
const emailConfig = new EmailConfig();

module.exports = emailConfig;

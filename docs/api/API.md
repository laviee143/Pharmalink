# PharmaLink API Documentation

## Overview

The PharmaLink API provides comprehensive RESTful endpoints for B2B pharmaceutical supply chain management. This document covers authentication, user management, medicine catalog, inventory management, order processing, payment handling, messaging, notifications, and reporting capabilities.

## Base Information

### Base URL
- **Development**: `https://api.pharmalink.dev.com/api/v1`
- **Staging**: `https://api.pharmalink.staging.com/api/v1`
- **Production**: `https://api.pharmalink.com/api/v1`

### Authentication
All API endpoints (except authentication endpoints) require JWT authentication:

```http
Authorization: Bearer <access_token>
```

### Rate Limiting
- **General**: 100 requests per 15 minutes
- **Authentication**: 5 requests per minute
- **Upload**: 10 requests per hour
- **Search**: 20 requests per minute

### Response Format
All responses follow standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PHARMACY",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PHARMACY",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "message": "User registered successfully"
}
```

### POST /auth/login
Authenticate user and return access tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PHARMACY",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "message": "Login successful"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/logout
Logout user and invalidate tokens.

**Request Body**:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/forgot-password
Send password reset email.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Reset password with token.

**Request Body**:
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

## User Management Endpoints

### GET /users
Get all users with pagination and filtering (Admin only).

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status

### GET /users/:id
Get user by ID.

### PUT /users/profile
Update authenticated user's profile.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345"
}
```

### PUT /users/:id
Update user (Admin only).

### DELETE /users/:id
Delete user (Admin only).

### PUT /users/change-password
Change user password.

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

## Medicine Management Endpoints

### GET /medicines
Get all medicines with pagination and filtering.

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `category` (string): Filter by category
- `form` (string): Filter by form
- `requiresPrescription` (boolean): Filter by prescription requirement
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

**Response**:
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": "uuid",
        "name": "Aspirin 500mg",
        "genericName": "Acetylsalicylic acid",
        "brand": "PharmaCorp",
        "category": "Analgesics",
        "form": "TABLET",
        "strength": "500mg",
        "unit": "tablets",
        "unitPrice": 15.99,
        "requiresPrescription": true,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### GET /medicines/:id
Get medicine by ID.

### POST /medicines
Create new medicine (Wholesaler/Admin only).

**Request Body**:
```json
{
  "name": "Aspirin 500mg",
  "genericName": "Acetylsalicylic acid",
  "brand": "PharmaCorp",
  "category": "Analgesics",
  "form": "TABLET",
  "strength": "500mg",
  "unit": "tablets",
  "unitPrice": 15.99,
  "requiresPrescription": true,
  "description": "Pain relief medication",
  "manufacturer": "PharmaCorp Inc.",
  "barcode": "1234567890123",
  "batchNumber": "BATCH001",
  "expiryDate": "2025-12-31",
  "storageConditions": "Store in cool, dry place"
}
```

### PUT /medicines/:id
Update medicine (Wholesaler/Admin only).

### DELETE /medicines/:id
Delete medicine (soft delete) (Wholesaler/Admin only).

### GET /medicines/search
Search medicines with advanced filtering.

### GET /medicines/categories
Get all medicine categories.

### GET /medicines/low-stock
Get medicines with low stock levels.

### GET /medicines/expiring
Get medicines expiring within specified timeframe.

## Inventory Management Endpoints

### GET /inventory
Get inventory items with pagination and filtering.

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `medicineId` (string): Filter by medicine
- `lowStock` (boolean): Filter low stock items
- `expiringSoon` (boolean): Filter expiring items
- `location` (string): Filter by location

### GET /inventory/:id
Get inventory item by ID.

### POST /inventory
Add new inventory item.

**Request Body**:
```json
{
  "medicineId": "uuid",
  "quantity": 100,
  "batchNumber": "BATCH001",
  "expiryDate": "2025-12-31",
  "purchasePrice": 12.50,
  "location": "Warehouse A",
  "minStockLevel": 20,
  "notes": "Initial stock"
}
```

### PUT /inventory/:id
Update inventory item.

### DELETE /inventory/:id
Delete inventory item.

### PUT /inventory/:id/adjust
Adjust inventory stock quantity.

**Request Body**:
```json
{
  "quantity": 150,
  "reason": "Stock adjustment - delivery received"
}
```

### GET /inventory/low-stock-alerts
Get low stock alerts.

### GET /inventory/expiring-items
Get expiring items.

### GET /inventory/summary
Get inventory summary statistics.

### PUT /inventory/bulk-update
Bulk update inventory items.

## Order Management Endpoints

### GET /orders
Get all orders with pagination and filtering.

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `customerId` (string): Filter by customer
- `supplierId` (string): Filter by supplier
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

### GET /orders/:id
Get order by ID.

### POST /orders
Create new order.

**Request Body**:
```json
{
  "items": [
    {
      "medicineId": "uuid",
      "quantity": 50,
      "unitPrice": 15.99,
      "batchNumber": "BATCH001"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "ST",
    "zipCode": "12345",
    "country": "US"
  },
  "deliveryInstructions": "Leave at front door"
}
```

### PUT /orders/:id
Update order.

### PUT /orders/:id/cancel
Cancel order.

**Request Body**:
```json
{
  "reason": "Customer requested cancellation"
}
```

### PUT /orders/:id/confirm
Confirm order (Wholesaler only).

**Request Body**:
```json
{
  "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z"
}
```

### PUT /orders/:id/ship
Ship order (Wholesaler only).

**Request Body**:
```json
{
  "trackingNumber": "1Z999999999999999999",
  "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z"
}
```

### PUT /orders/:id/deliver
Mark order as delivered (Wholesaler only).

**Request Body**:
```json
{
  "deliveryNotes": "Delivered to front door, customer signed"
}
```

### GET /orders/statistics
Get order statistics.

### GET /orders/:id/items
Get order items.

### POST /orders/:id/items
Add order item.

### PUT /orders/:id/items/:itemId
Update order item.

### DELETE /orders/:id/items/:itemId
Delete order item.

## Payment Processing Endpoints

### GET /payments
Get all payments with pagination and filtering.

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `method` (string): Filter by payment method
- `orderId` (string): Filter by order
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

### GET /payments/:id
Get payment by ID.

### POST /payments
Create payment record.

**Request Body**:
```json
{
  "orderId": "uuid",
  "amount": 799.50,
  "method": "CREDIT_CARD",
  "notes": "Payment for order #12345"
}
```

### PUT /payments/:id
Update payment (Admin only).

### POST /payments/process
Process payment through payment gateway.

**Request Body**:
```json
{
  "orderId": "uuid",
  "method": "CREDIT_CARD",
  "amount": 799.50
  "currency": "USD"
}
```

### POST /payments/verify
Verify payment status from gateway.

**Request Body**:
```json
{
  "paymentId": "uuid",
  "gatewayResponse": {
    "status": "success",
    "transactionId": "txn_123456789"
  }
}
```

### POST /payments/:id/refund
Process refund (Admin only).

**Request Body**:
```json
{
  "amount": 799.50,
  "reason": "Customer requested refund"
}
```

### GET /payments/methods
Get available payment methods.

### GET /payments/history
Get payment history.

### POST /payments/invoice
Create invoice.

## Messaging Endpoints

### GET /messages
Get all messages with pagination and filtering.

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `userId` (string): Filter by user
- `orderId` (string): Filter by order
- `unread` (boolean): Filter unread messages

### GET /messages/:id
Get message by ID.

### POST /messages
Send new message.

**Request Body**:
```json
{
  "receiverId": "uuid",
  "orderId": "uuid",
  "type": "TEXT",
  "content": "I need to order item #12345",
  "attachments": [
    {
      "filename": "prescription.pdf",
      "originalName": "prescription_123.pdf"
    }
  ]
}
```

### POST /messages/:id/reply
Reply to message.

**Request Body**:
```json
{
  "content": "This item is available",
  "attachments": []
}
```

### PUT /messages/:id/read
Mark message as read.

### PUT /messages/mark-read
Mark multiple messages as read.

**Request Body**:
```json
{
  "messageIds": ["uuid1", "uuid2", "uuid3"]
}
```

### DELETE /messages/:id
Delete message.

### GET /messages/conversation/:userId
Get conversation between two users.

### GET /messages/unread-count
Get unread message count.

### GET /messages/search
Search messages.

### GET /messages/:id/attachments
Get message attachments.

### GET /messages/attachments/:id
Download message attachment.

### GET /messages/threads
Get message threads.

## Notification Endpoints

### GET /notifications
Get all notifications with pagination and filtering.

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): Filter by type
- `unread` (boolean): Filter unread notifications
- `channels` (array): Filter by channels

### GET /notifications/:id
Get notification by ID.

### POST /notifications
Create notification (Admin only).

### PUT /notifications/:id/read
Mark notification as read.

### PUT /notifications/mark-read
Mark multiple notifications as read.

### DELETE /notifications/:id
Delete notification.

### GET /notifications/unread-count
Get unread notification count.

### GET /notifications/types
Get available notification types.

### GET /notifications/preferences
Get notification preferences.

### PUT /notifications/preferences
Update notification preferences.

### POST /notifications/bulk
Send bulk notifications (Admin only).

### GET /notifications/statistics
Get notification statistics.

### POST /notifications/test
Send test notification (Admin only).

## Reporting Endpoints

### GET /reports/sales
Get sales reports.

**Query Parameters**:
- `startDate` (string): Report start date
- `endDate` (string): Report end date
- `period` (string): Grouping period (day, week, month, year)

### GET /reports/inventory
Get inventory reports.

**Query Parameters**:
- `includeExpiring` (boolean): Include expiring items
- `includeLowStock` (boolean): Include low stock items

### GET /reports/financial
Get financial reports (Admin only).

### GET /reports/user-activity
Get user activity reports (Admin only).

**Query Parameters**:
- `startDate` (string): Report start date
- `endDate` (string): Report end date
- `userId` (string): Filter by user

### GET /reports/order-analytics
Get order analytics.

**Query Parameters**:
- `startDate` (string): Report start date
- `endDate` (string): Report end date
- `period` (string): Grouping period

### GET /reports/medicine-performance
Get medicine performance reports.

### GET /reports/dashboard
Get dashboard summary.

### POST /reports/export
Export report to CSV.

**Request Body**:
```json
{
  "reportType": "sales",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "format": "csv"
}
```

## Error Codes

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Application Error Codes
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Account locked
- `AUTH_003`: Token expired
- `USER_001`: User not found
- `USER_002`: Email not verified
- `USER_003`: Account inactive
- `ORDER_001`: Order not found
- `ORDER_002`: Order cannot be modified
- `ORDER_003`: Insufficient stock
- `PAYMENT_001`: Payment failed
- `PAYMENT_002`: Insufficient funds
- `INVENTORY_001`: Medicine not found
- `INVENTORY_002`: Insufficient stock

## SDK and Client Libraries

### JavaScript/TypeScript
```bash
npm install @pharmalink/api-client
```

### Python
```bash
pip install pharmalink-python-sdk
```

### Postman Collection
Download the official Postman collection for testing all endpoints:
[https://api.pharmalink.com/postman-collection](https://api.pharmalink.com/postman-collection)

## Testing

### Test Environment
- **Base URL**: `https://api.pharmalink.dev.com/api/v1`
- **Test Credentials**: Available in developer portal

### Sample Requests
See the Postman collection for complete request/response examples.

## Support

### Documentation Updates
This API documentation is regularly updated. Check the changelog for the latest updates.

### Contact
- **API Support**: api-support@pharmalink.com
- **Developer Portal**: developers.pharmalink.com
- **Status Page**: status.pharmalink.com

---

**Last Updated**: January 20, 2024
**Version**: 1.0.0

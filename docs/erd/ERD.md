# PharmaLink - Entity Relationship Diagram

## Overview

This document describes the database schema and entity relationships for the PharmaLink B2B platform, connecting pharmacies with wholesalers for efficient medicine procurement and supply chain management.

## Core Entities

### 1. User
**Purpose**: Central entity representing all system users with role-based access control.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `email` (Unique): User email address for authentication
- `password`: Encrypted password hash
- `firstName`: User's first name
- `lastName`: User's last name
- `role`: User role (ADMIN, PHARMACY, WHOLESALER)
- `phone`: Contact phone number
- `address`: Physical address
- `isEmailVerified`: Email verification status
- `isActive`: Account active status
- `lastLoginAt`: Last login timestamp
- `lastLogoutAt`: Last logout timestamp
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- One-to-Many with Orders (as Customer)
- One-to-Many with Orders (as Supplier)
- One-to-Many with Inventory
- One-to-Many with Messages (as Sender)
- One-to-Many with Messages (as Receiver)
- One-to-Many with Notifications
- One-to-One with NotificationPreferences

### 2. Medicine
**Purpose**: Product catalog entity containing all medicine information.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `name`: Medicine commercial name
- `genericName`: Generic name of the medicine
- `brand`: Brand/manufacturer name
- `category`: Therapeutic category
- `form`: Dosage form (TABLET, CAPSULE, LIQUID, INJECTION)
- `strength`: Medicine strength/dosage
- `unit`: Unit of measurement (mg, ml, etc.)
- `unitPrice`: Price per unit
- `requiresPrescription`: Prescription requirement flag
- `description`: Medicine description
- `manufacturer`: Manufacturing company
- `barcode`: Unique barcode for scanning
- `batchNumber`: Batch tracking number
- `expiryDate`: Expiration date
- `storageConditions`: Storage requirements
- `isActive`: Active status flag
- `createdBy`: Creator user ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- One-to-Many with Inventory
- One-to-Many with OrderItems
- Many-to-One with User (as created by)

### 3. Inventory
**Purpose**: Stock management entity tracking medicine quantities by location.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `medicineId` (Foreign Key): Reference to Medicine
- `userId` (Foreign Key): Reference to User
- `quantity`: Current stock quantity
- `location`: Storage location
- `batchNumber`: Specific batch number
- `expiryDate`: Expiration date for this batch
- `purchasePrice`: Purchase price per unit
- `minStockLevel`: Minimum stock threshold
- `notes`: Additional notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with Medicine
- Many-to-One with User
- One-to-Many with StockAdjustments
- One-to-Many with OrderItems (through Medicine)

### 4. Order
**Purpose**: Central transaction entity representing purchase orders.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `orderNumber`: Human-readable order number
- `customerId` (Foreign Key): Reference to User (Pharmacy)
- `supplierId` (Foreign Key): Reference to User (Wholesaler)
- `status`: Order status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- `subtotal`: Subtotal before tax and shipping
- `tax`: Calculated tax amount
- `shippingCost`: Shipping cost
- `totalAmount`: Final total amount
- `currency`: Currency code (USD)
- `shippingAddress`: Delivery address (JSON)
- `deliveryInstructions`: Special delivery notes
- `estimatedDeliveryDate`: Expected delivery date
- `actualDeliveryDate`: Actual delivery date
- `trackingNumber`: Shipping tracking number
- `notes`: Order notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with Customer (User)
- Many-to-One with Supplier (User)
- One-to-Many with OrderItems
- One-to-Many with Payments
- One-to-Many with Messages
- One-to-Many with Notifications

### 5. OrderItem
**Purpose**: Line items within orders, linking medicines to orders.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `orderId` (Foreign Key): Reference to Order
- `medicineId` (Foreign Key): Reference to Medicine
- `quantity`: Quantity ordered
- `unitPrice`: Price per unit at time of order
- `totalPrice`: Total price (quantity × unitPrice)
- `batchNumber`: Specific batch number
- `notes`: Item-specific notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with Order
- Many-to-One with Medicine

### 6. Payment
**Purpose**: Financial transaction entity tracking all payments.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `orderId` (Foreign Key): Reference to Order
- `userId` (Foreign Key): Reference to User
- `amount`: Payment amount
- `currency`: Currency code (USD)
- `method`: Payment method (CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, etc.)
- `status`: Payment status (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
- `transactionId`: Gateway transaction ID
- `gatewayResponse`: Response from payment gateway (JSON)
- `notes`: Payment notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with Order
- Many-to-One with User
- One-to-Many with Invoices

### 7. Message
**Purpose**: Communication entity for user interactions.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `senderId` (Foreign Key): Reference to User
- `receiverId` (Foreign Key): Reference to User
- `orderId` (Foreign Key, Optional): Reference to Order
- `type`: Message type (TEXT, ATTACHMENT, SYSTEM)
- `content`: Message content
- `isRead`: Read status flag
- `readAt`: Read timestamp
- `isDeleted`: Soft delete flag
- `deletedAt`: Deletion timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with Sender (User)
- Many-to-One with Receiver (User)
- Many-to-One with Order (Optional)
- One-to-Many with MessageAttachments
- Many-to-One with ParentMessage (self-reference for threads)

### 8. MessageAttachment
**Purpose**: File attachments for messages.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `messageId` (Foreign Key): Reference to Message
- `filename`: Stored filename
- `originalName`: Original filename
- `mimeType`: MIME type
- `fileSize`: File size in bytes
- `filePath`: Storage path
- `createdAt`: Creation timestamp

**Relationships**:
- Many-to-One with Message

### 9. Notification
**Purpose**: Alert system entity for user notifications.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `userId` (Foreign Key): Reference to User
- `type`: Notification type (ORDER_CREATED, LOW_STOCK, NEW_MESSAGE, etc.)
- `title`: Notification title
- `message`: Notification message
- `channels`: Delivery channels (EMAIL, SMS, PUSH, IN_APP)
- `isRead`: Read status flag
- `readAt`: Read timestamp
- `data`: Additional data (JSON)
- `scheduledAt`: Scheduled delivery timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with User
- One-to-One with NotificationPreferences

### 10. NotificationPreference
**Purpose**: User preferences for notification delivery.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `userId` (Foreign Key): Reference to User
- `emailNotifications`: Email notification preference
- `smsNotifications`: SMS notification preference
- `pushNotifications`: Push notification preference
- `inAppNotifications`: In-app notification preference
- `orderNotifications`: Order-related notifications preference
- `paymentNotifications`: Payment-related notifications preference
- `messageNotifications`: Message-related notifications preference
- `systemNotifications`: System notification preference
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with User

### 11. Invoice
**Purpose**: Billing entity for order transactions.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `orderId` (Foreign Key): Reference to Order
- `userId` (Foreign Key): Reference to User
- `invoiceNumber`: Human-readable invoice number
- `status`: Invoice status (PENDING, PAID, CANCELLED)
- `subtotal`: Order subtotal
- `tax`: Calculated tax
- `totalAmount`: Total amount
- `currency`: Currency code
- `notes`: Invoice notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- Many-to-One with Order
- Many-to-One with User
- One-to-Many with InvoiceItems

### 12. Supporting Entities

#### 12.1 StockAdjustment
**Purpose**: Audit trail for inventory changes.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `inventoryId` (Foreign Key): Reference to Inventory
- `previousQuantity`: Quantity before adjustment
- `newQuantity`: Quantity after adjustment
- `reason`: Adjustment reason
- `adjustedBy` (Foreign Key): Reference to User
- `createdAt`: Creation timestamp

#### 12.2 UserActivity
**Purpose**: Audit trail for user actions.

**Attributes**:
- `id` (Primary Key): Unique identifier
- `userId` (Foreign Key): Reference to User
- `action`: Action performed (LOGIN, LOGOUT, CREATE, UPDATE, DELETE)
- `details`: Action details (JSON)
- `ipAddress`: User's IP address
- `userAgent`: Browser user agent
- `createdAt`: Creation timestamp

## Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────┐    ┌─────────────────┐    │
│                    │    User        │    │    User        │    │
│                    └─────┬─────────┘    └─────┬─────────┘    │
│                          │                    │                    │
│                          │                    │                    │
│          ┌─────────────┐    │    ┌─────────────┐    │    ┌─────────────┐
│          │   Message   │    │    │ Notification │    │    │ Notification │
│          └─────┬──────┘    │    └─────┬──────┘    │    └─────┬──────┘
│                │              │                   │                   │
│                │              │                   │                   │
│  ┌─────────────┐│  ┌─────────────┐   │  ┌─────────────┐   │  ┌─────────────┐
│  │   Medicine   │  │   │ Inventory │   │  │   │   │   │
│  └─────┬──────┘│  └─────┬──────┘   │  └─────┬──────┘   │  └─────┬──────┘
│         │             │                   │                   │         │             │
│         │             │                   │                   │         │             │
│  ┌─────────────┐│  ┌─────────────┐   │  ┌─────────────┐   │  ┌─────────────┐   │
│  │   Order     │  │   │   OrderItem │   │  │   │   │   │
│  └─────┬──────┘│  └─────┬──────┘   │  └─────┬──────┘   │  └─────┬──────┘
│         │             │                   │                   │         │             │
│         │             │                   │                   │         │             │
│  ┌─────────────┐│  ┌─────────────┐   │  ┌─────────────┐   │  ┌─────────────┐   │
│  │   Payment    │  │   │   Invoice    │   │  │   │   │   │
│  └─────────────┘│  └─────┬──────┘   │  └─────┬──────┘   │  └─────┬──────┘
│                │              │                   │                   │         │             │
└────────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## Key Relationships

### Core Business Flows

#### 1. Order Flow
1. **Order Creation**: User (Pharmacy) → Order → OrderItems → Medicine
2. **Order Confirmation**: Order → User (Wholesaler) → Order (status update)
3. **Order Fulfillment**: Order → Inventory (stock check) → OrderItems (allocation)
4. **Payment Processing**: Order → Payment → Order (status update)
5. **Delivery Tracking**: Order → Tracking updates → Notifications

#### 2. Inventory Flow
1. **Stock Addition**: Medicine → Inventory (quantity increase)
2. **Stock Consumption**: Order → Inventory (quantity decrease)
3. **Low Stock Alert**: Inventory → Notification (threshold check)
4. **Expiry Alert**: Inventory → Notification (date check)

#### 3. Communication Flow
1. **Message Creation**: User → Message → Notification (receiver)
2. **Message Reading**: User → Message (read status update)
3. **Thread Creation**: Message → Message (parent/child relationship)

## Data Integrity Constraints

### Primary Keys
- All entities have auto-incrementing UUID primary keys
- Ensures uniqueness and scalability

### Foreign Keys
- All relationships use proper foreign key constraints
- Cascading deletes configured appropriately
- Referential integrity maintained

### Indexes
- Composite indexes on frequently queried fields
- Full-text search indexes on text fields
- Date-based indexes for time-series queries

## Performance Considerations

### Database Optimization
- **Partitioning**: Orders by date for better query performance
- **Indexing Strategy**: Based on query patterns and access frequency
- **Connection Pooling**: Configured for high concurrency
- **Caching Layer**: Redis for frequently accessed data

### Scalability Patterns
- **Horizontal Scaling**: Database sharding capability
- **Read Replicas**: For reporting and analytics queries
- **CQRS Pattern**: Separate read/write models for complex operations
- **Event Sourcing**: Audit trail and replay capability

---

**Document Control**: This ERD is maintained by the PharmaLink development team and reflects the current database schema. All changes require proper migration procedures and documentation updates.

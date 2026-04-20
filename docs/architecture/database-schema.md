# PharmaLink Database Schema Documentation

## Overview

This document describes the database schema for the PharmaLink platform, which connects pharmacies with wholesalers for medicine procurement and inventory management.

## Database Design Principles

1. **Normalization**: Follow 3NF normalization rules
2. **Scalability**: Designed for horizontal scaling
3. **Performance**: Optimized indexes and queries
4. **Security**: Data encryption and access controls
5. **Audit Trail**: Complete tracking of data changes

## Core Entities

### 1. Users Table

**Purpose**: Stores user authentication and profile information

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    last_logout_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role AS ENUM ('ADMIN', 'PHARMACY', 'WHOLESALER');
```

**Indexes**:
- `users_email_unique` (email)
- `users_role_index` (role)
- `users_active_index` (is_active)

### 2. Medicines Table

**Purpose**: Stores medicine catalog information

```sql
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    description TEXT,
    category medicine_category NOT NULL,
    brand VARCHAR(100),
    strength VARCHAR(50),
    form medicine_form NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    manufacturer VARCHAR(255),
    barcode VARCHAR(50) UNIQUE,
    requires_prescription BOOLEAN DEFAULT FALSE,
    storage_conditions TEXT,
    side_effects TEXT,
    contraindications TEXT,
    dosage TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE medicine_category AS ENUM (
    'ANTIBIOTICS', 'PAIN_RELIEVERS', 'VITAMINS', 'COLD_FLU', 
    'ALLERGY', 'DIABETES', 'HEART', 'DIGESTIVE', 'SKIN_CARE',
    'EYE_CARE', 'FIRST_AID', 'PRESCRIPTION', 'OVER_THE_COUNTER'
);

CREATE TYPE medicine_form AS ENUM (
    'TABLET', 'CAPSULE', 'LIQUID', 'CREAM', 'OINTMENT',
    'INJECTION', 'INHALER', 'SPRAY', 'DROPS', 'PATCH',
    'SUPPOSITORY', 'POWDER'
);
```

**Indexes**:
- `medicines_name_index` (name)
- `medicines_category_index` (category)
- `medicines_active_index` (is_active)
- `medicines_barcode_unique` (barcode)

### 3. Inventory Table

**Purpose**: Tracks stock levels and inventory details

```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    user_id UUID NOT NULL REFERENCES users(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    batch_number VARCHAR(50),
    expiry_date DATE,
    purchase_price DECIMAL(10,2),
    location VARCHAR(100),
    min_stock_level INTEGER DEFAULT 10,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(medicine_id, user_id, batch_number)
);

CREATE INDEX inventory_medicine_user_index ON inventory(medicine_id, user_id);
CREATE INDEX inventory_expiry_index ON inventory(expiry_date);
CREATE INDEX inventory_low_stock_index ON inventory(quantity, min_stock_level);
```

### 4. Orders Table

**Purpose**: Manages purchase orders from pharmacies to wholesalers

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id),
    supplier_id UUID NOT NULL REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address TEXT NOT NULL,
    delivery_instructions TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE order_status AS ENUM (
    'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 
    'DELIVERED', 'CANCELLED', 'RETURNED'
);

CREATE INDEX orders_customer_index ON orders(customer_id);
CREATE INDEX orders_supplier_index ON orders(supplier_id);
CREATE INDEX orders_status_index ON orders(status);
CREATE INDEX orders_date_index ON orders(created_at);
```

### 5. Order Items Table

**Purpose**: Stores individual items within an order

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX order_items_order_index ON order_items(order_id);
CREATE INDEX order_items_medicine_index ON order_items(medicine_id);
```

### 6. Payments Table

**Purpose**: Tracks payment transactions

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    gateway_response TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE payment_method AS ENUM (
    'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 
    'CASH_ON_DELIVERY', 'DIGITAL_WALLET'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 
    'REFUNDED', 'PARTIALLY_REFUNDED'
);

CREATE INDEX payments_order_index ON payments(order_id);
CREATE INDEX payments_user_index ON payments(user_id);
CREATE INDEX payments_status_index ON payments(status);
```

### 7. Messages Table

**Purpose**: Handles communication between users

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    type message_type NOT NULL DEFAULT 'TEXT',
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE message_type AS ENUM (
    'TEXT', 'IMAGE', 'DOCUMENT', 'VOICE', 'VIDEO'
);

CREATE INDEX messages_sender_receiver_index ON messages(sender_id, receiver_id);
CREATE INDEX messages_order_index ON messages(order_id);
CREATE INDEX messages_created_index ON messages(created_at);
```

### 8. Message Attachments Table

**Purpose**: Stores file attachments for messages

```sql
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX message_attachments_message_index ON message_attachments(message_id);
```

### 9. Notifications Table

**Purpose**: Manages system notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channels notification_channel[] DEFAULT ARRAY['IN_APP'],
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE TYPE notification_type AS ENUM (
    'ORDER_CREATED', 'ORDER_CONFIRMED', 'ORDER_SHIPPED', 'ORDER_DELIVERED',
    'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'LOW_STOCK', 'EXPIRING_SOON',
    'NEW_MESSAGE', 'SYSTEM_UPDATE'
);

CREATE TYPE notification_channel AS ENUM (
    'EMAIL', 'SMS', 'PUSH', 'IN_APP'
);

CREATE INDEX notifications_user_index ON notifications(user_id);
CREATE INDEX notifications_type_index ON notifications(type);
CREATE INDEX notifications_read_index ON notifications(is_read);
```

### 10. Audit Log Table

**Purpose**: Tracks all data changes for audit purposes

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX audit_log_table_record_index ON audit_log(table_name, record_id);
CREATE INDEX audit_log_user_index ON audit_log(user_id);
CREATE INDEX audit_log_created_index ON audit_log(created_at);
```

## Relationships

### Entity Relationship Diagram

```
Users (1) -----> (N) Orders (Customer)
Users (1) -----> (N) Orders (Supplier)
Users (1) -----> (N) Inventory
Users (1) -----> (N) Messages (Sender)
Users (1) -----> (N) Messages (Receiver)
Users (1) -----> (N) Notifications

Medicines (1) -----> (N) Inventory
Medicines (1) -----> (N) Order Items

Orders (1) -----> (N) Order Items
Orders (1) -----> (N) Payments
Orders (1) -----> (N) Messages

Messages (1) -----> (N) Message Attachments
```

## Data Integrity Constraints

### Foreign Key Constraints
- All foreign keys are properly indexed
- ON DELETE CASCADE for dependent data
- ON UPDATE CASCADE for referenced data

### Unique Constraints
- User emails must be unique
- Medicine barcodes must be unique
- Order numbers must be unique
- Inventory combinations must be unique

### Check Constraints
- Quantity values must be non-negative
- Price values must be positive
- Dates must be valid

## Performance Optimization

### Indexes
- Primary key indexes on all tables
- Foreign key indexes for join performance
- Composite indexes for common query patterns
- Partial indexes for filtered queries

### Partitioning
- Orders table partitioned by date
- Audit log table partitioned by date
- Messages table partitioned by date

### Query Optimization
- Prepared statements for parameterized queries
- Query result caching
- Connection pooling

## Security Considerations

### Data Encryption
- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- Data encrypted in transit (TLS)

### Access Control
- Row-level security for multi-tenant data
- Column-level security for sensitive fields
- Audit logging for all data changes

### Data Privacy
- PII data masking
- Data retention policies
- GDPR compliance features

## Backup and Recovery

### Backup Strategy
- Daily full backups
- Hourly incremental backups
- Point-in-time recovery capability

### Disaster Recovery
- Cross-region replication
- Automated failover
- Recovery time objective (RTO): 4 hours
- Recovery point objective (RPO): 1 hour

## Migration Strategy

### Schema Versioning
- All schema changes versioned
- Migration scripts for each version
- Rollback capability for each migration
- Testing in staging environment

### Data Migration
- ETL processes for data import
- Data validation post-migration
- Performance testing post-migration
- Rollback plan for failed migrations

## Monitoring and Maintenance

### Database Monitoring
- Query performance monitoring
- Index usage analysis
- Table size monitoring
- Connection pool monitoring

### Maintenance Tasks
- Regular vacuum and analyze
- Index rebuilding
- Statistics updates
- Log rotation

---

*Document Version: 1.0*
*Last Updated: April 20, 2026*
*Next Review: May 20, 2026*

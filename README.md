# PharmaLink - Pharmacy-Wholesaler Platform

A comprehensive B2B platform connecting pharmacies with wholesalers for efficient medicine procurement and inventory management.

## Overview

PharmaLink is a scalable web-based platform that streamlines the pharmaceutical supply chain by enabling pharmacies to directly connect with wholesalers for medicine procurement, inventory management, and order processing.

## System Features

### Core Functionality
- **Multi-Role Authentication**: Admin, Pharmacy, and Wholesaler roles with granular permissions
- **Medicine Management**: Complete CRUD operations with categories, expiry tracking, and batch management
- **Inventory Management**: Real-time stock tracking, low-stock alerts, and automated replenishment
- **Order System**: Shopping cart, order placement, and comprehensive order management
- **Payment Processing**: Secure transaction handling with verification and payment history
- **Messaging System**: Real-time communication between pharmacies and wholesalers
- **Notification System**: Automated alerts for orders, payments, and inventory updates
- **Analytics & Reporting**: Business intelligence dashboards and custom reports

## Technology Stack

### Backend
- **Node.js** (Express.js) - RESTful API server
- **PostgreSQL** - Primary database with Prisma ORM
- **Redis** - Caching and session management
- **JWT** - Authentication and authorization
- **Socket.io** - Real-time messaging
- **Bull Queue** - Background job processing

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy and load balancing
- **GitHub Actions** - CI/CD pipeline

## Repository Structure

```
Pharmalink/
|
|-- backend/                    # Node.js API server
|   |-- src/
|   |   |-- controllers/        # Request handlers
|   |   |   |-- auth/
|   |   |   |-- users/
|   |   |   |-- medicines/
|   |   |   |-- inventory/
|   |   |   |-- orders/
|   |   |   |-- payments/
|   |   |   |-- messages/
|   |   |   `-- notifications/
|   |   |-- services/           # Business logic
|   |   |   |-- auth/
|   |   |   |-- user/
|   |   |   |-- medicine/
|   |   |   |-- inventory/
|   |   |   |-- order/
|   |   |   |-- payment/
|   |   |   |-- message/
|   |   |   `-- notification/
|   |   |-- models/             # Data models
|   |   |   |-- User.js
|   |   |   |-- Medicine.js
|   |   |   |-- Inventory.js
|   |   |   |-- Order.js
|   |   |   |-- Payment.js
|   |   |   |-- Message.js
|   |   |   `-- Notification.js
|   |   |-- routes/             # API routes
|   |   |   |-- auth/
|   |   |   |-- users/
|   |   |   |-- medicines/
|   |   |   |-- inventory/
|   |   |   |-- orders/
|   |   |   |-- payments/
|   |   |   |-- messages/
|   |   |   `-- notifications/
|   |   |-- middlewares/        # Custom middleware
|   |   |   |-- auth.js
|   |   |   |-- validation.js
|   |   |   |-- rateLimit.js
|   |   |   |-- errorHandler.js
|   |   |   `-- logger.js
|   |   |-- config/             # Configuration files
|   |   |   |-- database.js
|   |   |   |-- redis.js
|   |   |   |-- email.js
|   |   |   `-- swagger.js
|   |   |-- utils/              # Utility functions
|   |   |   |-- helpers.js
|   |   |   |-- constants.js
|   |   |   |-- validators.js
|   |   |   `-- response.js
|   |   |-- app.js              # Express app setup
|   |   `-- server.js           # Server entry point
|   |-- prisma/
|   |   |-- schema.prisma       # Database schema
|   |   |-- migrations/         # Database migrations
|   |   `-- seed.js             # Database seeding
|   |-- tests/                  # Test files
|   |   |-- unit/
|   |   |-- integration/
|   |   `-- e2e/
|   |-- package.json
|   `-- .env.example
|
|-- docs/                       # Documentation
|   |-- api/                    # API documentation
|   |   |-- swagger.yaml
|   |   `-- postman_collection.json
|   |-- architecture/           # System architecture
|   |   |-- system-design.md
|   |   |-- database-schema.md
|   |   `-- erd-diagram.png
|   |-- deployment/             # Deployment guides
|   |   |-- docker-setup.md
|   |   |-- production-deploy.md
|   |   `-- monitoring.md
|   |-- development/            # Development guides
|   |   |-- getting-started.md
|   |   |-- coding-standards.md
|   |   `-- testing-guide.md
|   `-- srs.md                  # Software Requirements Specification
|
|-- config/                     # Configuration files
|   |-- docker-compose.yml      # Development environment
|   |-- docker-compose.prod.yml # Production environment
|   |-- nginx.conf               # Nginx configuration
|   `-- .env.example            # Environment variables template
|
|-- scripts/                    # Utility scripts
|   |-- setup.sh               # Project setup
|   |-- deploy.sh              # Deployment script
|   |-- backup.sh              # Database backup
|   `-- seed-data.sh           # Data seeding
|
|-- .github/                    # GitHub workflows
|   |-- workflows/
|   |   |-- ci.yml             # Continuous Integration
|   |   |-- cd.yml             # Continuous Deployment
|   |   `-- security.yml       # Security scanning
|   |-- ISSUE_TEMPLATE/
|   `-- PULL_REQUEST_TEMPLATE.md
|
|-- .gitignore
|-- README.md
`-- LICENSE

## Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature-specific branches
- **hotfix/***: Critical bug fixes
- **release/***: Release preparation

## Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test additions
- `chore`: Maintenance tasks

### Examples:
```
feat(auth): implement JWT authentication
fix(inventory): resolve stock calculation bug
docs(api): update payment endpoints documentation
refactor(order): optimize order processing logic
test(medicine): add unit tests for medicine service
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v6+)
- Docker & Docker Compose
- Git

### Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/laviee143/Pharmalink.git
cd Pharmalink
```

2. **Environment setup**
```bash
cp config/.env.example .env
# Edit .env with your configuration
```

3. **Docker setup (Recommended)**
```bash
docker-compose up -d
```

4. **Manual setup**
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Create database
createdb pharmalink

# Run migrations
npm run migrate

# Generate Prisma client
npm run generate

# Seed database (optional)
npm run seed
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Development Setup

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pharmalink

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Redis
REDIS_URL=redis://localhost:6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Database Setup
```bash
# Create database
createdb pharmalink

# Run migrations
npm run migrate

# Generate client
npm run generate

# Seed data
npm run seed
```

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Database
npm run migrate      # Run migrations
npm run migrate:dev  # Run development migrations
npm run generate     # Generate Prisma client
npm run seed         # Seed database
npm run studio       # Open Prisma Studio

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

## API Documentation

### Swagger/OpenAPI
- **Development**: `http://localhost:5000/api-docs`
- **Production**: `https://api.pharmalink.com/api-docs`

### Authentication
All API endpoints (except auth) require JWT authentication:

```bash
# Get access token
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Use token in headers
Authorization: Bearer <access_token>
```

### Rate Limiting
- **General**: 100 requests per 15 minutes
- **Auth**: 5 requests per minute
- **Upload**: 10 requests per hour

### Error Handling
Standardized error responses:

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

## Project Structure

```
Pharmalink/
backend/
src/
  modules/                    # Feature-based modules
    auth/
      controllers/           # Request handlers
      services/              # Business logic
      routes/                # API routes
      models/                # Data models
      middleware/            # Module-specific middleware
      utils/                 # Module utilities
      validators/            # Input validation
    users/                   # User management
    medicines/               # Medicine catalog
    inventory/               # Stock management
    orders/                  # Order processing
    payments/                # Payment processing
    messages/                # Messaging system
    notifications/           # Notifications
    reports/                 # Analytics & reporting
  config/                    # Configuration files
    database.js              # Database connection
    redis.js                 # Redis connection
    email.js                 # Email service
    swagger.js               # API documentation
  middlewares/               # Global middleware
    auth.js                  # Authentication
    validation.js            # Input validation
    rateLimit.js             # Rate limiting
    errorHandler.js          # Error handling
    logger.js                # Logging
  utils/                     # Shared utilities
    helpers.js               # Helper functions
    constants.js             # Application constants
    errors.js                # Custom errors
    response.js              # Response formatting
    validators.js            # Validation schemas
  app.js                     # Express application
  server.js                  # Server entry point
tests/                       # Test files
  unit/                      # Unit tests
  integration/               # Integration tests
  e2e/                       # End-to-end tests
docs/                        # Documentation
  api/                       # API docs
  architecture/              # Architecture docs
  deployment/                # Deployment guides
  development/               # Development guides
```

## Database Schema

### Core Entities
- **Users**: Authentication and role management
- **Medicines**: Product catalog and specifications
- **Inventory**: Stock levels and batch tracking
- **Orders**: Purchase orders and fulfillment
- **Payments**: Financial transactions
- **Messages**: Communication system
- **Notifications**: Alert system

### Relationships
- Users can be Pharmacies or Wholesalers
- Orders belong to Customers (Pharmacies) and Suppliers (Wholesalers)
- Inventory items belong to Users and reference Medicines
- Messages connect Users with optional Order context
- Notifications target Users with various types and channels

### Schema Documentation
See `docs/architecture/database-schema.md` for detailed schema design.

## Testing

### Test Structure
```
tests/
  unit/                      # Unit tests
    services/                # Service layer tests
    utils/                   # Utility function tests
    middleware/              # Middleware tests
  integration/               # Integration tests
    routes/                  # API endpoint tests
    database/                # Database tests
  e2e/                      # End-to-end tests
    auth/                    # Authentication flows
    orders/                  # Order workflows
    payments/                # Payment processes
```

### Running Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage
- Target: 90%+ coverage
- Reports: HTML and LCOV formats
- CI Integration: Automated coverage reporting

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t pharmalink-backend .

# Run container
docker run -p 5000:5000 pharmalink-backend
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Optimized for performance and security

### CI/CD Pipeline
- **Continuous Integration**: Automated testing and quality checks
- **Continuous Deployment**: Automated deployment to staging/production
- **Security Scanning**: Vulnerability assessment and dependency checks
- **Performance Testing**: Load testing and optimization

## Security

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Session management with Redis
- Password hashing with bcrypt

### Data Protection
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection with Helmet
- CSRF protection for state-changing operations

### Rate Limiting
- Intelligent rate limiting by endpoint
- DDoS protection
- API abuse prevention
- User-based throttling

### Compliance
- GDPR compliance features
- Data encryption at rest and in transit
- Audit logging for compliance
- Privacy controls and data retention

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with proper testing
4. Commit changes: `git commit -m 'feat: Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write comprehensive tests
- Document public APIs
- Follow semantic versioning

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code formatting
- `refactor:` Code refactoring
- `test:` Testing
- `chore:` Maintenance

### Pull Request Process
- Automated checks must pass
- Code review required
- Documentation updates
- Test coverage maintained

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/laviee143/Pharmalink/issues)
- **Discussions**: [GitHub Discussions](https://github.com/laviee143/Pharmalink/discussions)
- **Email**: support@pharmalink.com
- **Documentation**: [Full Documentation](https://docs.pharmalink.com)

---

**PharmaLink** - Connecting Pharmacies with Wholesalers, Efficiently.

## Support

For support and questions:
- Create an issue in the repository
- Email: support@pharmalink.com
- Documentation: [docs/](./docs/)

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

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
```bash
# Backend setup
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

5. **Seed database**
```bash
cd backend
npm run seed
```

## API Documentation

- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: Available in `docs/api/`
- **API Reference**: `docs/api/swagger.yaml`

## Development Workflow

1. Create feature branch from `develop`
2. Implement changes following coding standards
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request to `develop`
6. Code review and merge
7. Release to `main`

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f config/docker-compose.prod.yml up -d
```

## Monitoring & Logging

- **Application Logs**: Structured logging with Winston
- **Database Monitoring**: Prisma query insights
- **Performance Monitoring**: APM integration
- **Health Checks**: `/health` endpoint

## Security

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting
- **Security Headers**: CORS, CSP, HSTS
- **Encryption**: Data encryption at rest and in transit

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Email: support@pharmalink.com
- Documentation: [docs/](./docs/)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

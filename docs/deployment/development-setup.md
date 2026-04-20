# Development Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **PostgreSQL**: Version 15.0 or higher
- **Redis**: Version 6.0 or higher
- **Git**: Version 2.30.0 or higher
- **Docker**: Version 20.10.0 or higher (optional)

### Development Tools
- **IDE**: VS Code, WebStorm, or similar
- **API Client**: Postman, Insomnia, or similar
- **Database Tool**: pgAdmin, DBeaver, or similar
- **Git Client**: SourceTree, Tower, or similar

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/laviee143/Pharmalink.git
cd Pharmalink
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn (alternative)
yarn install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# Configure database connection, JWT secrets, email settings, etc.
```

### 4. Database Setup

#### PostgreSQL Setup
```bash
# Create database
createdb pharmalink

# Create user
createuser pharmalink_user with password 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pharmalink TO pharmalink_user;

# Connect to database
psql -h localhost -U pharmalink_user -d pharmalink
```

#### Redis Setup
```bash
# Start Redis server
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

### 5. Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### 6. Start Development Server
```bash
# Start development server
npm run dev

# Start with hot reload
npm run dev:hot

# Start in debug mode
npm run dev:debug
```

## Development Scripts

### Available Scripts
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Generate Prisma client
npm run generate

# Open Prisma Studio
npm run studio

# Build for production
npm run build

# Start production server
npm start

# Docker commands
npm run docker:build
npm run docker:run
npm run docker:dev
```

## Environment Variables

### Required Variables
```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://pharmalink_user:password@localhost:5432/pharmalink
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pharmalink
DATABASE_USER=pharmalink_user
DATABASE_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secret_refresh_key_minimum_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_if_any

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=PharmaLink <noreply@pharmalink.com>

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_PASSWORD_RESET_MAX=3

# Security Configuration
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your_session_secret_here_minimum_32_characters
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
FRONTEND_DOMAIN=localhost

# External Services
PAYMENT_GATEWAY_URL=https://api.payment-provider.com
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
SMS_SERVICE_URL=https://api.sms-provider.com
SMS_SERVICE_KEY=your_sms_service_key

# Development Configuration
ENABLE_SWAGGER=true
ENABLE_CORS=true
ENABLE_MORGAN_LOGGING=true

# Production Configuration
ENABLE_HTTPS=false
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem

# Testing Configuration
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/pharmalink_test
TEST_REDIS_URL=redis://localhost:6379/1

# Docker Configuration
DOCKER_REGISTRY=your-registry.com
DOCKER_IMAGE_TAG=latest
DOCKER_BUILD_ARGS=--no-cache
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Make your changes
# Follow coding standards
# Write tests for new features
# Update documentation as needed
```

### 3. Run Tests
```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

### 4. Commit Changes
```bash
# Stage changes
git add .

# Commit with conventional message
git commit -m "feat: Add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Use pull request template
- Ensure all tests pass
- Request code review
- Update documentation if needed

## Code Quality Standards

### Linting Rules
- Use ESLint configuration
- Follow JavaScript Standard Style
- No console.log statements in production
- Use proper error handling

### Code Formatting
- Use Prettier for consistent formatting
- 2-space indentation
- Single quotes for strings
- Trailing commas avoided

### Testing Requirements
- Minimum 80% test coverage
- Unit tests for all functions
- Integration tests for API endpoints
- E2E tests for critical user flows

## Database Management

### Prisma Commands
```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Studio
npx prisma studio
```

### Database Backups
```bash
# Backup production database
pg_dump pharmalink > backup_$(date +%Y%m%d).sql

# Restore from backup
psql pharmalink < backup_20240120.sql
```

## API Development

### Local Development
```bash
# Start API server
npm run dev

# API will be available at http://localhost:5000
# Swagger docs at http://localhost:5000/api-docs
```

### Testing APIs
```bash
# Use Postman collection
# Import into Postman/Insomnia
# Test all endpoints
# Check response formats
# Verify authentication flows
```

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Check connection
psql -h localhost -U pharmalink_user -d pharmalink

# Reset connection
npm run db:reset
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :5000

# Kill process on port
kill -9 $(lsof -t -i:5000)

# Use different port
PORT=5001 npm run dev
```

#### Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall dependencies
npm install
```

## Performance Optimization

### Development Performance
```bash
# Enable hot reload
npm run dev:hot

# Use nodemon for auto-restart
npm run dev:watch

# Profile memory usage
node --inspect-brk src/server.js
```

## Security Best Practices

### Development Security
- Use environment variables for secrets
- Never commit sensitive data
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use parameterized queries

### API Security
- Implement JWT authentication
- Use HTTPS for all endpoints
- Implement CORS properly
- Rate limit all endpoints
- Validate and sanitize inputs
- Implement proper error handling

## Monitoring and Debugging

### Application Monitoring
```bash
# Enable debug logging
DEBUG=pharmalink:* npm run dev

# Monitor with PM2
pm2 start npm --name pharmalink

# Check application health
curl http://localhost:5000/api/health
```

### Debug Tools
- Chrome DevTools for frontend debugging
- Postman/Insomnia for API testing
- Prisma Studio for database inspection
- Winston logs for application debugging

## Production Deployment

### Environment Preparation
```bash
# Set production environment
export NODE_ENV=production

# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t pharmalink-backend .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f pharmalink-backend
```

---

**Support**: For development issues, contact the development team or create an issue in the GitHub repository.

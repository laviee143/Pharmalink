# PharmaLink - Pharmacy Management System

A comprehensive pharmacy management system built with Node.js, PostgreSQL, and React.

## Features

- **Inventory Management**: Track medications, stock levels, and expiry dates
- **Prescription Management**: Process and manage customer prescriptions
- **Billing & Invoicing**: Generate invoices and manage payments
- **User Authentication**: Secure role-based access control
- **Reporting**: Analytics and sales reports
- **Customer Management**: Maintain customer records and purchase history

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **Prisma** ORM for database management

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management

## Project Structure

```
Pharmalink/
├── backend/          # Node.js API server
├── frontend/         # React application
├── database/         # Database schema and migrations
├── docker-compose.yml # Docker configuration
└── README.md        # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/laviee143/Pharmalink.git
cd Pharmalink
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
DATABASE_URL="postgresql://username:password@localhost:5432/pharmalink"
JWT_SECRET="your-secret-key"
PORT=5000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

4. Run database migrations:
```bash
cd backend
npx prisma migrate dev
```

5. Start the development servers:
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm start
```

## API Documentation

The API documentation will be available at `http://localhost:5000/api-docs` when running the development server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

const app = require('./app');
const { logger } = require('./middlewares/logger');
const { connectDB } = require('./config/database');

/**
 * Server entry point
 * Starts the Express server and connects to the database
 */

const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    // Add database cleanup here if needed
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(PORT, async () => {
  try {
    // Connect to database
    await connectDB();
    
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`API documentation: http://localhost:${PORT}/api-docs`);
    
    // Log startup information
    logger.info('PharmaLink API server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;

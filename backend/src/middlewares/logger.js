const winston = require('winston');
const path = require('path');

/**
 * Logging middleware
 * Centralized logging configuration for the application
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'pharmalink-api' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  next(err);
};

/**
 * Security event logger
 */
const securityLogger = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Database operation logger
 */
const dbLogger = (operation, details = {}) => {
  logger.info('Database operation', {
    operation,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Authentication logger
 */
const authLogger = (event, details = {}) => {
  logger.info('Authentication event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Business logic logger
 */
const businessLogger = (event, details = {}) => {
  logger.info('Business event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Performance logger
 */
const performanceLogger = (operation, duration, details = {}) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * External API call logger
 */
const externalApiLogger = (api, method, url, statusCode, duration, details = {}) => {
  logger.info('External API call', {
    api,
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * File operation logger
 */
const fileLogger = (operation, filename, details = {}) => {
  logger.info('File operation', {
    operation,
    filename,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Cache operation logger
 */
const cacheLogger = (operation, key, details = {}) => {
  logger.debug('Cache operation', {
    operation,
    key,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Create child logger with additional context
 */
const createChildLogger = (context) => {
  return logger.child(context);
};

/**
 * Performance monitoring middleware
 */
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      performanceLogger('slow_request', duration, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode
      });
    }
  });

  next();
};

/**
 * Database query monitoring
 */
const dbQueryMonitor = (query, duration) => {
  if (duration > 100) {
    logger.warn('Slow database query', {
      query: query.substring(0, 200), // Truncate long queries
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  securityLogger,
  dbLogger,
  authLogger,
  businessLogger,
  performanceLogger,
  externalApiLogger,
  fileLogger,
  cacheLogger,
  createChildLogger,
  performanceMonitor,
  dbQueryMonitor
};

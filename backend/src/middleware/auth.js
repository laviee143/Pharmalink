const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};

module.exports = { auth, authorize };

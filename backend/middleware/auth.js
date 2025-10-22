const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorizedResponse, errorResponse } = require('../utils/responseHelper');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return unauthorizedResponse(res, 'Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).where({ softDelete: false });

      if (!req.user) {
        return unauthorizedResponse(res, 'User not found');
      }

      if (!req.user.isActive) {
        return unauthorizedResponse(res, 'User account is inactive');
      }

      next();
    } catch (error) {
      return unauthorizedResponse(res, 'Invalid token');
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Middleware to check specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};



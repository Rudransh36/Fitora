const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Validates JWT bearer token, checks signature, and mounts the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token (supports both uppercase and lowercase secret fallback)
      let decoded;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'Fitora_super_secret_jwt_key_2026_sports_platform'
        );
      } catch (signErr) {
        const altSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.startsWith('f'))
          ? 'Fitora_super_secret_jwt_key_2026_sports_platform'
          : 'fitora_super_secret_jwt_key_2026_sports_platform';
        decoded = jwt.verify(token, altSecret);
      }

      // Attach user from database (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The athlete belonging to this token no longer exists.'
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Token has expired or is invalid.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided. Please log in.'
    });
  }
};

module.exports = { protect };

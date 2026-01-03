import User from '../models/User.js'; // Assuming User model path

export const restaurantMiddleware = async (req, res, next) => {
  // Check if authMiddleware ran and populated req.user
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // 1. Check Role
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only registered restaurants can perform this action.'
    });
  }

  // 2. Check Verification Status (CRITICAL STEP)
  if (!req.user.restaurantDetails || req.user.restaurantDetails.isVerified !== true) {
    return res.status(403).json({
      success: false,
      message: 'Restaurant must be approved by admin to manage deals.'
    });
  }

  next();
};
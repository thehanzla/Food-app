import jwt from 'jsonwebtoken'
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  let token;

  // 1. Check for token in Cookies (Preferred)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Check for token in Authorization Header (Fallback)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found in either place
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token found"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check different possible user ID fields
    const userId = decoded.userId || decoded.id || decoded._id;

    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed"
    });
  }
}
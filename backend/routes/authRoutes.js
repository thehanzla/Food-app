import express from 'express';
import {
  signup,
  login,
  refreshToken,
  logout,
  verifySignup,
  verifyLogin,
  forgotPassword,
  verifyOTP,
  resetPassword,
  toggleFavorite,
  getFavorites
} from '../controllers/authController.js';

import { validateSignup, validateLogin } from '../middlewares/validationMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

console.log("DEBUG: Auth Routes Init");

// User Profile Routes (Placed first to avoid conflicts)
// User Profile Routes (Placed first to avoid conflicts)
router.post('/favorites/toggle', authMiddleware, toggleFavorite);

// DEBUG ROUTE - REMOVE LATER
router.get('/favorites', (req, res, next) => {
  console.log(">> HIT /favorites ROUTE HANDLER in authRoutes");
  next();
}, authMiddleware, getFavorites);

router.get('/debug-fav', (req, res) => {
  console.log(">> HIT /debug-fav ROUTE");
  res.json({ message: "Debug route works!" });
});
router.get('/test-favorites', (req, res) => res.json({ msg: 'working' }));

router.post('/register', validateSignup, signup);
router.post('/verify-signup', verifySignup);

router.post('/login', validateLogin, login);
router.post('/verify-login', verifyLogin);

router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
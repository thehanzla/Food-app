import express from 'express';
import {
  submitRestaurantRequest,
  getRestaurantRequests,
  updateRequestStatus,
  getDashboardStats,
  getUserRequestStatus,
  getAllRestaurants,
  getExternalRestaurants,
  getExternalRestaurantDetails,
  updateRestaurantSettings,
  getManualDeals // <-- ADD THIS
} from '../controllers/restaurantController.js';
import {
  createDeal,
  getRestaurantDeals,
  getAllDeals,
  deleteDeal
} from '../controllers/dealController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { restaurantMiddleware } from '../middlewares/restaurantMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// ===================================
// USER/RESTAURANT ROUTES
// ===================================

// Check Status
router.get('/user-request-status', authMiddleware, getUserRequestStatus);

// Public Restaurant List
router.get('/list', getAllRestaurants);
router.get('/list/external', getExternalRestaurants);
router.get('/external/:id', getExternalRestaurantDetails);
router.get('/deals/external', getManualDeals);

// Submit Application
// Submit Application
router.post('/request', authMiddleware, upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), submitRestaurantRequest);

// DEAL ROUTES (Requires verified restaurant status)
router.post(
  '/deals',
  authMiddleware,
  restaurantMiddleware,
  upload.single('image'),
  createDeal
);

router.get('/deals/my', authMiddleware, restaurantMiddleware, getRestaurantDeals);

// NEW DELETE DEAL ROUTE (Owner-Only Deletion)
router.delete(
  '/deals/:dealId', // Expects ID in the URL parameter
  authMiddleware,
  restaurantMiddleware, // Ensures the user is a verified restaurant
  deleteDeal // Logic ensures the restaurantOwner field matches req.user._id
);

// PUBLIC DEAL VIEWING ROUTE
router.get('/deals', getAllDeals);

// SETTINGS ROUTE
router.put('/settings', authMiddleware, restaurantMiddleware, updateRestaurantSettings);

// ===================================
// ADMIN ROUTES (Protected)
// ===================================

router.get('/requests', authMiddleware, adminMiddleware, getRestaurantRequests);
router.put('/requests/:requestId', authMiddleware, adminMiddleware, updateRequestStatus);
router.get('/dashboard/stats', authMiddleware, adminMiddleware, getDashboardStats);

export default router;
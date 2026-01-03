import express from 'express';
import {
  createOrder,
  getMyOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { restaurantMiddleware } from '../middlewares/restaurantMiddleware.js';

const router = express.Router();

// Public (or semi-public) - Create Order
router.post('/', createOrder);

// Protected Restaurant Routes
router.get('/restaurant', authMiddleware, restaurantMiddleware, getMyOrders);
router.patch('/:orderId/status', authMiddleware, restaurantMiddleware, updateOrderStatus);

export default router;

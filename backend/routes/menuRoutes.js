import express from 'express';
import {
  addMenuItem,
  getMyMenuItems,
  getPublicMenu,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { restaurantMiddleware } from '../middlewares/restaurantMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public Route
router.get('/:restaurantId', getPublicMenu);

// Protected Restaurant Routes
router.post('/', authMiddleware, restaurantMiddleware, upload.single('image'), addMenuItem);
router.get('/items/my', authMiddleware, restaurantMiddleware, getMyMenuItems);
router.put('/:itemId', authMiddleware, restaurantMiddleware, upload.single('image'), updateMenuItem);
router.delete('/:itemId', authMiddleware, restaurantMiddleware, deleteMenuItem);

export default router;

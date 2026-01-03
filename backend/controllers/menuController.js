import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import Deal from '../models/Deal.js';
import mongoose from 'mongoose';

// Create a new menu item
export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    // Image handling would go here (using the uploaded file path)
    const image = req.file ? req.file.path : null;

    const menuItem = new MenuItem({
      restaurant: req.user._id,
      name,
      description,
      price,
      category,
      image,
      isAvailable: isAvailable === 'true' || isAvailable === true
    });

    await menuItem.save();
    res.status(201).json({ success: true, data: menuItem });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get all menu items for the logged-in restaurant (Dashboard view)
export const getMyMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.user._id }).sort({ category: 1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get public menu for a specific restaurant
export const getPublicMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Validate ID format
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Invalid Restaurant Link' });
    }

    // Fetch Restaurant Details
    const restaurant = await User.findById(restaurantId).select('restaurantDetails.businessName restaurantDetails.cuisine restaurantDetails.discounts');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const items = await MenuItem.find({ restaurant: restaurantId, isAvailable: true }).sort({ category: 1 });

    // Fetch Active Deals for this restaurant
    const activeDeals = await Deal.find({
      restaurantOwner: restaurantId,
      isAvailable: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items,
      deals: activeDeals,
      restaurant: {
        name: restaurant.restaurantDetails?.businessName || 'Restaurant',
        cuisine: restaurant.restaurantDetails?.cuisine,
        discounts: restaurant.restaurantDetails?.discounts
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.image = req.file.path;
    }

    const item = await MenuItem.findOneAndUpdate(
      { _id: itemId, restaurant: req.user._id },
      updates,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await MenuItem.findOneAndDelete({ _id: itemId, restaurant: req.user._id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

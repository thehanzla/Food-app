import Deal from '../models/Deal.js';
import User from '../models/User.js'; // Imported to access User model fields

// --- 1. Create a New Deal (Restaurant Owner Only) ---
export const createDeal = async (req, res) => {
  try {
    const { title, description, originalPrice, dealPrice, expiresAt } = req.body;
    const userId = req.user._id;

    const restaurantName = req.user.restaurantDetails?.businessName;

    if (!restaurantName) {
      return res.status(400).json({ success: false, message: "Restaurant details missing. Please contact admin." });
    }

    const deal = new Deal({
      restaurantOwner: userId,
      restaurantName,
      title,
      description,
      originalPrice,
      dealPrice,
      expiresAt,
      image: req.file ? {
        fileName: req.file.originalname,
        filePath: req.file.path.replace(/\\/g, "/"),
        fileType: req.file.mimetype
      } : null
    });

    await deal.save();

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: deal
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating deal',
      error: error.message
    });
  }
};

// --- 2. Get All Deals (Public/Customer View) ---
export const getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isAvailable: true, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: deals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deals',
      error: error.message
    });
  }
};

// --- 3. Get Deals by the Logged-in Restaurant Owner ---
export const getRestaurantDeals = async (req, res) => {
  try {
    const userId = req.user._id;

    const deals = await Deal.find({ restaurantOwner: userId })
      .sort({ expiresAt: 1 });

    res.status(200).json({
      success: true,
      data: deals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your deals',
      error: error.message
    });
  }
};

// --- 4. Delete a Deal (Restaurant Owner Only) ---
export const deleteDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const userId = req.user._id; // The ID of the authenticated user

    // CRITICAL: Use findOneAndDelete with two conditions: _id AND restaurantOwner
    const deal = await Deal.findOneAndDelete({
      _id: dealId,
      restaurantOwner: userId
    });

    if (!deal) {
      // If deal is null, it means either the ID was wrong OR the user didn't own it.
      return res.status(404).json({
        success: false,
        message: 'Deal not found or you do not have permission to delete it.'
      });
    }

    // NOTE: In a real app, you would delete the physical image file here if it existed.

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting deal',
      error: error.message
    });
  }
};
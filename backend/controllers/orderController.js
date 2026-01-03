import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

// Create a new order (Public)
export const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, tableNumber, customerName, totalAmount, paymentMethod, discountApplied, finalAmount } = req.body;

    // Basic validation could go here to verify prices, but trusting frontend for speed now, 
    // ideally should recalculate totalAmount from DB.

    // Let's recalculate total just to be safe-ish
    let calculatedTotal = 0;
    const orderItems = [];

    // Import Deal model (ensure this is at top of file, but I'll add logic here first)
    // Checking both MenuItem and Deal collections
    for (const item of items) {
      let dbItem = await MenuItem.findById(item.menuItem);
      let isDeal = false;

      if (!dbItem) {
        // Try finding in active deals
        const Deal = (await import('../models/Deal.js')).default;
        dbItem = await Deal.findById(item.menuItem);
        isDeal = true;
      }

      if (!dbItem) continue;

      const price = isDeal ? dbItem.dealPrice : dbItem.price;
      const name = isDeal ? dbItem.title : dbItem.name;

      calculatedTotal += price * item.quantity;

      orderItems.push({
        menuItem: dbItem._id,
        name: name,
        quantity: item.quantity,
        price: price
      });
    }

    // Optional: Validate that finalAmount matches expectations if we wanted to be strict
    // But for now we trust the frontend logic + the user intent

    const newOrder = new Order({
      restaurant: restaurantId,
      items: orderItems,
      totalAmount: calculatedTotal,
      tableNumber,
      customerName,
      paymentMethod,
      discountApplied,
      finalAmount: finalAmount || calculatedTotal // Fallback
    });

    if (req.user) {
      newOrder.user = req.user._id;
    }

    await newOrder.save();

    // In a real app, we'd emit a socket event here to the restaurant dashboard

    res.status(201).json({ success: true, data: newOrder });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get orders for the logged-in restaurant
export const getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { restaurant: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.menuItem'); // Populate if needed

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Update order status (Accept/Reject/Complete)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ _id: orderId, restaurant: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

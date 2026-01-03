import RestaurantRequest from '../models/RestaurantRequest.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import fs from 'fs'; // Import fs to read file buffers

// Submit restaurant registration request
export const submitRestaurantRequest = async (req, res) => {
  try {
    const { businessName, cuisine, location, famousFor } = req.body;
    const userId = req.user._id || req.user.id;

    // Check if user already has a pending request
    const existingRequest = await RestaurantRequest.findOne({
      user: userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending restaurant request'
      });
    }

    // Create restaurant request
    const files = req.files || {};
    const restaurantRequest = new RestaurantRequest({
      user: userId,
      businessName,
      cuisine,
      location,
      famousFor,
      document: files['document'] ? {
        fileName: files['document'][0].originalname,
        // Convert to Base64 for Vercel Persistence
        filePath: `data:${files['document'][0].mimetype};base64,${fs.readFileSync(files['document'][0].path).toString('base64')}`,
        fileType: files['document'][0].mimetype
      } : null,
      image: files['image'] ? {
        fileName: files['image'][0].originalname,
        // Convert to Base64 for Vercel Persistence
        filePath: `data:${files['image'][0].mimetype};base64,${fs.readFileSync(files['image'][0].path).toString('base64')}`
      } : null
    });

    await restaurantRequest.save();

    res.status(201).json({
      success: true,
      message: 'Restaurant registration request submitted successfully',
      data: restaurantRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting restaurant request',
      error: error.message
    });
  }
};

// Get all restaurant requests (Admin only)
export const getRestaurantRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await RestaurantRequest.find(filter)
      .populate('user', 'fullName email createdAt')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant requests',
      error: error.message
    });
  }
};

// Approve/Reject restaurant request (Admin only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    const request = await RestaurantRequest.findById(requestId).populate('user', 'email fullName');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant request not found'
      });
    }

    request.status = status;
    request.adminNotes = adminNotes || '';
    request.reviewedAt = new Date();

    await request.save();

    let emailSubject = '';
    let emailText = '';

    if (status === 'approved') {
      emailSubject = `Congratulations! Your FoodieAI Partnership is Approved`;
      emailText = `Dear ${request.user.fullName},\n\nWe are thrilled to inform you that your registration request for ${request.businessName} has been approved!\n\nWelcome to the FoodieAI partner network. You can now access your full restaurant dashboard.\n\nBest regards,\nFoodieAI Admin Team`;

      await User.findByIdAndUpdate(request.user._id, {
        role: 'restaurant',
        restaurantDetails: {
          businessName: request.businessName,
          cuisine: request.cuisine,
          location: request.location,
          famousFor: request.famousFor,
          isVerified: true,
          verificationDocument: request.document?.filePath,
          image: request.image?.filePath
        }
      });
    } else if (status === 'rejected') {
      emailSubject = `Update Regarding Your FoodieAI Partnership Request`;
      emailText = `Dear ${request.user.fullName},\n\nWe regret to inform you that your registration request for ${request.businessName} has been rejected.\n\nReason for rejection: ${adminNotes}\n\nPlease update your application and resubmit if you wish to proceed.\n\nBest regards,\nFoodieAI Admin Team`;
    }

    if (emailSubject) {
      await sendEmail(request.user.email, emailSubject, emailText);
    }

    res.status(200).json({
      success: true,
      message: `Restaurant request ${status} successfully`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant request',
      error: error.message
    });
  }
};

// Get dashboard stats (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await RestaurantRequest.countDocuments();
    const pendingRequests = await RestaurantRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await RestaurantRequest.countDocuments({ status: 'approved' });
    const rejectedRequests = await RestaurantRequest.countDocuments({ status: 'rejected' });
    const totalRestaurants = await User.countDocuments({ role: 'restaurant' });

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalRestaurants
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

export const getUserRequestStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const request = await RestaurantRequest.findOne({ user: userId })
      .sort({ submittedAt: -1 })
      .select('businessName status adminNotes submittedAt');

    if (!request) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No request submitted yet."
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user request status',
      error: error.message
    });
  }
};

// Get all verified restaurants for public listing
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({
      role: 'restaurant',
      'restaurantDetails.isVerified': true
    })
      .select('restaurantDetails.businessName restaurantDetails.cuisine restaurantDetails.location restaurantDetails.famousFor _id');

    const formattedRestaurants = restaurants.map(r => ({
      _id: r._id,
      businessName: r.restaurantDetails.businessName,
      cuisine: r.restaurantDetails.cuisine,
      location: r.restaurantDetails.location,
      famousFor: r.restaurantDetails.famousFor
    }));

    res.status(200).json({
      success: true,
      data: formattedRestaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
};

// Manual List of 20+ High Quality Pakistani Restaurants (Lahore Focus)
export const MANUAL_RESTAURANTS = [
  {
    id: "man-1",
    name: "Butt Karahi",
    cuisine: "Desi",
    address: "Lakshmi Chowk, Lahore",
    description: "The most iconic Karahi in Lahore. Known for its rich buttery taste and fresh desi chicken.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1000",
    rating: 4.4,
    menu: [
      { name: "Desi Mutton Karahi (Makhan)", price: 3800, description: "Prepared in pure butter (makhan) with black pepper", category: "Karahi" },
      { name: "Chicken Karahi (Desi Ghee)", price: 2600, description: "Organic chicken in pure ghee", category: "Karahi" },
      { name: "Desi Murgh Karahi", price: 2400, description: "Traditional style with bone-in chicken", category: "Karahi" },
      { name: "Roghn Naan", price: 120, description: "Sesame seed topped tandoori bread", category: "Breads" },
      { name: "Zeera Raita", price: 150, description: "Yogurt with roasted cumin", category: "Sides" }
    ]
  },
  {
    id: "man-2",
    name: "Mohammadi Nihari House",
    cuisine: "Desi",
    address: "Mozang Chrangi, Lahore",
    description: "Legendary Nihari spot serving the city for decades. A breakfast staple for Lahoris.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000",
    rating: 4.2,
    menu: [
      { name: "Special Beef Nihari (Nalli)", price: 1200, description: "Slow-cooked beef shank with bone marrow", category: "Nihari" },
      { name: "Maghaz Nihari", price: 1500, description: "Nihari topped with fried brain", category: "Nihari" },
      { name: "Fry Maghaz Masala", price: 800, description: "Spicy brain masala fry", category: "Sides" },
      { name: "Khameeri Roti", price: 60, description: "Fluffy fermented bread", category: "Breads" }
    ]
  },
  {
    id: "man-3",
    name: "Haveli Restaurant",
    cuisine: "BBQ",
    address: "Fort Road Food Street, Lahore",
    description: "Experience the grandeur of Badshahi Mosque while dining on exquisite BBQ.",
    image: "https://images.unsplash.com/photo-1582560475093-6e06cb230553?q=80&w=1000",
    rating: 4.6,
    menu: [
      { name: "Mutton Chops", price: 2800, description: "Charcoal grilled marinated chops", category: "BBQ" },
      { name: "Reshmi Kabab", price: 1400, description: "Silk-texture minced chicken skewers", category: "BBQ" },
      { name: "Haveli Special Platter", price: 4500, description: "Assortment of BBQ items (Serves 4)", category: "Platters" },
      { name: "Palak Paneer", price: 950, description: "Spinach with cottage cheese", category: "Veg" }
    ]
  },
  {
    id: "man-4",
    name: "Cooco's Den",
    cuisine: "Traditional",
    address: "Roshnai Gate, Lahore",
    description: "A historic artistic haven serving traditional recipes passed down through generations.",
    image: "https://images.unsplash.com/photo-159679703855c-61968e83ee76?q=80&w=1000",
    rating: 4.3,
    menu: [
      { name: "Tawa Chicken", price: 2100, description: "Spicy chicken cooked on a large griddle with green chilies", category: "Specialty" },
      { name: "Lahori Fried Fish", price: 1900, description: "Crispy battered fish fillet", category: "Fish" },
      { name: "Daal Makhni", price: 900, description: "Black lentils with cream", category: "Veg" },
      { name: "Sweet Lassi (Pera)", price: 450, description: "Traditional yogurt drink with sweet crumble", category: "Drinks" }
    ]
  },
  {
    id: "man-5",
    name: "Waris Nihari",
    cuisine: "Desi",
    address: "Abid Market, Lahore",
    description: "Deep, rich, and spicy. Waris Nihari is for the true connoisseurs of spice.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000",
    rating: 4.5,
    menu: [
      { name: "Beef Nihari Large", price: 1100, description: "Extra spicy beef shank stew", category: "Nihari" },
      { name: "Nalli Fry", price: 400, description: "Fried bone marrow addition", category: "Add-on" },
      { name: "Tarakay Wali Roti", price: 70, description: "Crispy tandoori bread with sesame", category: "Breads" }
    ]
  },
  {
    id: "man-6",
    name: "Phajja Siri Paye",
    cuisine: "Desi",
    address: "Shahi Mohallah, Walled City",
    description: "The most famous breakfast point in Androon Lahore. Known for sticky, delicious trotters.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1000",
    rating: 4.1,
    menu: [
      { name: "Mutton Paye", price: 1500, description: "Slow cooked goat trotters", category: "Breakfast" },
      { name: "Siri (Head Meat)", price: 1200, description: "Tender goat head meat curry", category: "Breakfast" },
      { name: "Bong Paye", price: 1800, description: "Beef trotters with shank meat", category: "Breakfast" },
      { name: "Kulcha", price: 60, description: "Traditional breakfast bread", category: "Breads" }
    ]
  },
  {
    id: "man-7",
    name: "Monal Lahore",
    cuisine: "Continental",
    address: "Liberty Roundabout, Gulberg",
    description: "Modern rooftop dining offering a mix of Desi, Continental, and Chinese with a view.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000",
    rating: 4.5,
    menu: [
      { name: "Monal Special Platter", price: 3800, description: "Mix of Malai Boti, Seekh Kabab & Fish Tikka", category: "Platters" },
      { name: "Chicken Makhni", price: 1600, description: "Boneless chicken in butter tomato gravy", category: "Desi" },
      { name: "Stuffed Chicken Breast", price: 1900, description: "With cheese and mushrooms, mashed potatoes side", category: "Continental" },
      { name: "Cheese Naan", price: 450, description: "Stuffed with cheddar and mozzarella", category: "Breads" }
    ]
  },
  {
    id: "man-8",
    name: "Spice Bazaar",
    cuisine: "Pakistani",
    address: "MM Alam Road, Lahore",
    description: "A celebration of Pakistani cuisine in a high-end, sophisticated ambiance.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
    rating: 4.4,
    menu: [
      { name: "Sunday Brunch Buffet", price: 2450, description: "Over 50 authentic dishes (Price per head)", category: "Buffet" },
      { name: "Mutton Kunna (Chinioti)", price: 2600, description: "Clay pot slow-cooked mutton", category: "Specialty" },
      { name: "Peshawari Chappal Kabab", price: 1400, description: "Large fried beef patty with pomegranate seeds", category: "Live Station" },
      { name: "Gajar Ka Halwa", price: 600, description: "Warm carrot pudding", category: "Dessert" }
    ]
  },
  {
    id: "man-9",
    name: "Bundu Khan",
    cuisine: "Desi",
    address: "Liberty Market, Lahore",
    description: "The gold standard for Desi BBQ and outdoor dining in Lahore.",
    image: "https://images.unsplash.com/photo-1529193591184-b1d580690dd0?q=80&w=1000",
    rating: 4.2,
    menu: [
      { name: "Chicken Tikka Leg", price: 650, description: "Signature spicy marinated chicken leg", category: "BBQ" },
      { name: "Behari Kabab", price: 1100, description: "Tenderized spicy beef strips", category: "BBQ" },
      { name: "Puri Paratha", price: 180, description: "Fried crispy layered bread", category: "Breads" },
      { name: "Imli Chutney", price: 50, description: "Tamarind sauce", category: "Sides" }
    ]
  },
  {
    id: "man-10",
    name: "Salt'n Pepper Village",
    cuisine: "Pakistani",
    address: "MM Alam Road, Lahore",
    description: "A village-themed buffet restaurant offering the complete range of Pakistani dishes.",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000",
    rating: 4.3,
    menu: [
      { name: "Dinner Buffet", price: 3200, description: "Over 60 items including BBQ, Karahi, Chinese", category: "Buffet" },
      { name: "Chapli Kabab", price: 0, description: "Available in buffet", category: "Live Station" },
      { name: "Gol Gappay", price: 0, description: "Live counter", category: "Street Food" },
      { name: "Fresh Jalebi", price: 0, description: "Live dessert station", category: "Dessert" }
    ]
  },
  {
    id: "man-11",
    name: "Arcadian Cafe",
    cuisine: "Italian",
    address: "Gulberg III, Lahore",
    description: "Chic modern cafe famous for its creamy pastas and signature mocktails.",
    image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000",
    rating: 4.6,
    menu: [
      { name: "Chicken Parmesan", price: 1800, description: "Fried chicken breast topped with marinara and cheese", category: "Mains" },
      { name: "Tarragon Chicken", price: 1900, description: "Creamy tarragon sauce with herbs", category: "Mains" },
      { name: "Red Dragon Chicken", price: 1700, description: "Spicy sticky red sauce", category: "Asian Fusion" },
      { name: "Blue Colada", price: 650, description: "Coconut and pineapple mocktail", category: "Drinks" }
    ]
  },
  {
    id: "man-12",
    name: "Yum Chinese & Thai",
    cuisine: "Chinese",
    address: "Z Block, DHA Phase 3",
    description: "The premier spot for authentic Chinese and Thai cuisine in a family setting.",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1000",
    rating: 4.5,
    menu: [
      { name: "Kung Pao Chicken", price: 1600, description: "Stir-fried with peanuts, vegetables, and chili peppers", category: "Chicken" },
      { name: "Beef Chili Dry", price: 1900, description: "Crispy beef strips in spicy glaze", category: "Beef" },
      { name: "Yum Special Soup", price: 800, description: "Thick soup with prawns and chicken", category: "Soup" },
      { name: "Egg Fried Rice", price: 900, description: "Classic wok-fried rice", category: "Rice" }
    ]
  },
  {
    id: "man-13",
    name: "Bamboo Union",
    cuisine: "Pan-Asian",
    address: "Mall 1, Main Boulevard",
    description: "Trendy spot bringing the best of Asian fusion from Thailand, Japan, and China.",
    image: "https://images.unsplash.com/photo-1512058560366-cd2427ff06d3?q=80&w=1000",
    rating: 4.3,
    menu: [
      { name: "Chicken Katsu Curry", price: 1850, description: "Panko fried chicken with Japanese curry sauce", category: "Bowls" },
      { name: "Pad Thai", price: 1600, description: "Rice noodles stir-fried with peanuts and tamarind", category: "Noodles" },
      { name: "Dynamite Prawns", price: 1400, description: "Crispy prawns tossed in spicy mayo", category: "Starters" },
      { name: "Beef Bulgogi", price: 1950, description: "Korean style marinated beef", category: "Beef" }
    ]
  },
  {
    id: "man-14",
    name: "Cafe Aylanto",
    cuisine: "Continental",
    address: "MM Alam Road, Lahore",
    description: "Sophisticated dining experience featuring European and Mediterranean classics.",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000",
    rating: 4.5,
    menu: [
      { name: "Beef Carpaccio", price: 2200, description: "Thinly sliced raw beef with parmesan and arugula", category: "Starters" },
      { name: "Moroccan Chicken", price: 2100, description: "Grilled chicken with spicy sambal sauce", category: "Mains" },
      { name: "Decked Beef Steak", price: 3400, description: "Premium tenderloin with mushroom sauce", category: "Steaks" },
      { name: "Molten Lava Cake", price: 1100, description: "Warm chocolate cake with vanilla ice cream", category: "Dessert" }
    ]
  },
  {
    id: "man-15",
    name: "Sardar Machli",
    cuisine: "Seafood",
    address: "Gawal Mandi, Lahore",
    description: "World famous fried fish. Crispy batter and soft, flaky meat inside.",
    image: "https://images.unsplash.com/photo-1596568297491-95449e798f45?q=80&w=1000",
    rating: 4.2,
    menu: [
      { name: "Fried Rahu Fish", price: 2400, description: "Signature battered fried fish (Per KG)", category: "Fish" },
      { name: "Fish Tikka", price: 2600, description: "Barbequed fish chunks with spices", category: "Fish" },
      { name: "Mint Chutney", price: 100, description: "Fresh mint sauce", category: "Sides" }
    ]
  },
  {
    id: "man-16",
    name: "Bhaiya Kabab",
    cuisine: "BBQ",
    address: "Model Town, Lahore",
    description: "Small shop, massive taste. Famous for their melt-in-the-mouth Seekh Kababs.",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1000",
    rating: 4.0,
    menu: [
      { name: "Seekh Kabab (Beef)", price: 180, description: "Juicy minced beef skewer (Per pc)", category: "BBQ" },
      { name: "Mutton Kabab", price: 250, description: "Premium mutton mince skewer", category: "BBQ" },
      { name: "Paratha", price: 90, description: "Oily fried bread", category: "Breads" }
    ]
  },
  {
    id: "man-17",
    name: "Nishat Cafe",
    cuisine: "Desi",
    address: "Lakshmi Chowk, Lahore",
    description: "A historic spot known for the best Mutton Karahi and Takatak in town.",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1000",
    rating: 4.1,
    menu: [
      { name: "Mutton Karahi", price: 3600, description: "Prepared fresh with tomatoes and green chilies", category: "Karahi" },
      { name: "Takatak (Kata-Kat)", price: 2200, description: "Minced mix of kidney, heart, and brain", category: "Specialty" },
      { name: "Brain Masala", price: 1800, description: "Spicy goat brain curry", category: "Specialty" }
    ]
  },
  {
    id: "man-18",
    name: "Amjad Tikka",
    cuisine: "BBQ",
    address: "Baghbanpura, Lahore",
    description: "Famous for their massive Tikkas and Karahis.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1000",
    rating: 3.9,
    menu: [
      { name: "Chicken Tikka Chest", price: 550, description: "Large piece charcoal grilled", category: "BBQ" },
      { name: "Mutton Tikka", price: 2200, description: "Spicy mutton cubes on skewer", category: "BBQ" },
      { name: "Raita Salad", price: 150, description: "Complete side servings", category: "Sides" }
    ]
  },
  {
    id: "man-19",
    name: "Taj Mahal Sweets",
    cuisine: "Desi",
    address: "Hera Mandi, Lahore",
    description: "Traditional breakfast spot famous for Halwa Puri since 1960.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000",
    rating: 4.4,
    menu: [
      { name: "Halwa Puri Platter", price: 450, description: "2 Puris, Chana, Halwa & Aloo Bhujia", category: "Breakfast" },
      { name: "Lassi Tall", price: 250, description: "Sweet yogurt drink", category: "Drinks" }
    ]
  },
  {
    id: "man-20",
    name: "Rina's Kitchenette",
    cuisine: "Continental",
    address: "Gulberg III, Lahore",
    description: "Home-style comfort food, famous for burgers and desserts.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000",
    rating: 4.5,
    menu: [
      { name: "The Smash Burger", price: 1400, description: "Double beef patty with cheese and secret sauce", category: "Burgers" },
      { name: "Three Cheese Cannelloni", price: 1600, description: "Pasta tubes filled with cheese and spinach", category: "Pasta" },
      { name: "Nutella Caramel Pie", price: 750, description: "Signature dessert slice", category: "Dessert" }
    ]
  },
  {
    id: "man-21",
    name: "Pizza 21",
    cuisine: "Fast Food",
    address: "PIA Road, Lahore",
    description: "New York style pizzas with generous toppings.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000",
    rating: 3.8,
    menu: [
      { name: "21 Special Pizza", price: 2400, description: "Loaded with pepperoni, sausages, and mushrooms (Large)", category: "Pizza" },
      { name: "Creamy Chicken Pizza", price: 2200, description: "White sauce base", category: "Pizza" }
    ]
  },
  {
    id: "man-22",
    name: "Andaaz Restaurant",
    cuisine: "Desi",
    address: "Fort Road Food Street",
    description: "A royal dining experience with a view of the Badshahi Mosque.",
    image: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?q=80&w=1000",
    rating: 4.5,
    menu: [
      { name: "Tandoori Jhinga", price: 2800, description: "Grilled jumbo prawns", category: "Seafood" },
      { name: "Paneer Tikka", price: 1200, description: "Grilled cottage cheese", category: "Veg" },
      { name: "Murgh Badami Korma", price: 1900, description: "Chicken curry with almond paste", category: "Mains" }
    ]
  },
  {
    id: "man-23",
    name: "Howdy",
    cuisine: "Fast Food",
    address: "MM Alam Road",
    description: "Cowboy themed burger joint known for charcoal grilled burgers.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000",
    rating: 4.3,
    menu: [
      { name: "Son of a Bun", price: 1300, description: "Double beef patty with cheese", category: "Burgers" },
      { name: "Rango", price: 1100, description: "Spicy chicken fillet burger", category: "Burgers" },
      { name: "Loaded Fries", price: 800, description: "Topped with jalapenos and cheese sauce", category: "Sides" }
    ]
  },
  {
    id: "man-24",
    name: "Gourmet Grill",
    cuisine: "Desi",
    address: "Various Locations",
    description: "Reliable and consistent BBQ and Karahi from the house of Gourmet.",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1000",
    rating: 4.1,
    menu: [
      { name: "Gourmet Special Karahi", price: 1800, description: "Chicken karahi", category: "Mains" },
      { name: "Mixed Grill Platter", price: 2500, description: "Assortment of kababs and tikkas", category: "BBQ" }
    ]
  },
  {
    id: "man-25",
    name: "Jade Cafe",
    cuisine: "Continental",
    address: "Gulberg / Defence",
    description: "Contemporary cafe offering a diverse menu from breakfast to dinner.",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000",
    rating: 4.3,
    menu: [
      { name: "Stuffed Chicken", price: 1400, description: "Fried chicken stuffed with cheese", category: "Mains" },
      { name: "Jade Special Pizza", price: 1600, description: "Thin crust", category: "Pizza" },
      { name: "Molten Lava", price: 800, description: "Best seller", category: "Dessert" }
    ]
  }
];


export const MANUAL_DEALS = [
  {
    title: "Solo Smash Combo",
    restaurant: "Rina's Kitchenette",
    price: 850,
    description: "Classic Smash Burger + Fries + Soft Drink",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1000"
  },
  {
    title: "Desi Karahi Feast",
    restaurant: "Butt Karahi",
    price: 1800,
    description: "Half Chicken Karahi + 2 Roghni Naan + Big Raita",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1000"
  },
  {
    title: "BOGOF Pizza Deal",
    restaurant: "Pizza 21",
    price: 1500,
    description: "Buy one Large Pizza get one Regular Free (Valid all day)",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000"
  },
  {
    title: "Chinese Fusion Bowl",
    restaurant: "Bamboo Union",
    price: 950,
    description: "Chicken Manchurian or Chowmein with Egg Fried Rice",
    image: "https://images.unsplash.com/photo-1512058560366-cd2427ff06d3?q=80&w=1000"
  },
  {
    title: "Royal BBQ Platter",
    restaurant: "Haveli Restaurant",
    price: 2500,
    description: "4 Reshmi Kababs, 4 Malai Boti, 2 Naans & Salad",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=1000"
  },
  {
    title: "Howdy Style Family Bundle",
    restaurant: "Howdy",
    price: 3200,
    description: "4 Burgers (Son of a Bun), 4 Fries, 1.5L Drink",
    image: "https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=1000"
  },
  {
    title: "Lahori Nashta Special",
    restaurant: "Phajja Siri Paye",
    price: 600,
    description: "1 Plate Paye + 2 Kulcha + Lassi",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1000"
  }
];

// GET: /api/restaurant/list/external
// Supports query params: page, limit, search, cuisine
export const getExternalRestaurants = async (req, res) => {
  try {
    let { page = 1, limit = 9, search = '', cuisine = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 9;

    // 1. Fetch Verified Partner Restaurants from DB
    const dbRestaurants = await User.find({
      role: 'restaurant',
      'restaurantDetails.isVerified': true
    }).select('restaurantDetails _id');

    const formattedDbRestaurants = dbRestaurants.map(r => ({
      id: r._id.toString(),
      name: r.restaurantDetails.businessName,
      cuisine: r.restaurantDetails.cuisine,
      address: r.restaurantDetails.location,
      description: r.restaurantDetails.famousFor || `Authentic ${r.restaurantDetails.cuisine} cuisine`,
      image: r.restaurantDetails.image ? `${process.env.BASE_URL || 'http://localhost:5000'}/${r.restaurantDetails.image}` : null,
      isPartner: true,
      menu: [] // Placeholder
    }));

    // 2. Merge with Manual Restaurants
    let results = [...formattedDbRestaurants, ...MANUAL_RESTAURANTS];

    // 3. Filter by Search (Name or Description)
    if (search) {
      const lowerSearch = search.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(lowerSearch) ||
        r.description.toLowerCase().includes(lowerSearch)
      );
    }

    // 4. Filter by Cuisine
    if (cuisine && cuisine !== 'All') {
      results = results.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
    }

    const total = results.length;
    const totalPages = Math.ceil(total / limit);

    // 5. Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = results.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      source: 'merged-api',
      count: total,
      totalPages: totalPages,
      currentPage: page,
      data: {
        results: {
          data: paginatedData
        }
      }
    });

  } catch (error) {
    console.error("Merged API Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// GET: /api/restaurant/external/:id
export const getExternalRestaurantDetails = async (req, res) => {
  const { id } = req.params;
  const restaurant = MANUAL_RESTAURANTS.find(r => r.id === id);

  if (restaurant) {
    return res.status(200).json({
      success: true,
      source: 'manual-detail',
      data: restaurant
    });
  }

  res.status(404).json({ success: false, message: "Restaurant not found" });
};

// Update Restaurant Settings (Discounts, etc.)
export const updateRestaurantSettings = async (req, res) => {
  try {
    const { discounts } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (discounts) {
      user.restaurantDetails.discounts = {
        ...user.restaurantDetails.discounts,
        ...discounts
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: user.restaurantDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating settings', error: error.message });
  }
};

// GET: /api/restaurant/deals/external
export const getManualDeals = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: MANUAL_DEALS
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching deals", error: error.message });
  }
};

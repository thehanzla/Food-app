import User from "../models/User.js";
import MenuItem from "../models/MenuItem.js";
import dotenv from 'dotenv';
import axios from 'axios';
// import { OpenRouter } from "@openrouter/sdk"; // Removing SDK

dotenv.config();

// const openrouter = new OpenRouter({ ... }); // Removing SDK instance

import { MANUAL_RESTAURANTS, MANUAL_DEALS } from './restaurantController.js';

import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithAI = async (req, res) => {
  try {
    const { message, userLocation } = req.body;

    // Check configuration
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "AI Service Configuration Error: Gemini API Key missing." });
    }

    // 1. Fetch Data (Restaurants)
    const restaurants = await User.find({ role: 'restaurant', 'restaurantDetails.isVerified': true })
      .select('restaurantDetails.businessName restaurantDetails.cuisine restaurantDetails.location');

    // 2. Fetch Active Deals
    const Deal = (await import("../models/Deal.js")).default;
    const activeDeals = await Deal.find({ isActive: true })
      .populate('restaurant', 'restaurantDetails.businessName restaurantDetails.location');

    // 3. Smart Menu Search
    const keywords = message.split(' ').filter(w => w.length > 3 && !['what', 'where', 'best', 'food', 'have', 'want', 'with', 'under', 'for', 'rupees', 'price'].includes(w.toLowerCase()));

    // Extract Budget (heuristic)
    let budget = null;
    const budgetMatch = message.match(/(\d+)/);
    if (budgetMatch) {
      const val = parseInt(budgetMatch[0]);
      if (val > 100) budget = val;
    }

    // --- QUERY MONGODB ITEMS ---
    let menuQuery = { isAvailable: true };
    const orConditions = [];

    if (keywords.length > 0) {
      orConditions.push(...keywords.map(k => ({
        $or: [
          { name: { $regex: k, $options: 'i' } },
          { description: { $regex: k, $options: 'i' } },
          { category: { $regex: k, $options: 'i' } }
        ]
      })));
    }

    if (budget) {
      orConditions.push({ price: { $lte: budget } });
    }

    if (orConditions.length > 0) {
      menuQuery.$or = orConditions;
    }

    const relevantItems = await MenuItem.find(menuQuery)
      .limit(15)
      .populate('restaurant', 'restaurantDetails.businessName restaurantDetails.location');

    // --- QUERY MANUAL RESTAURANTS ---
    let relevantManualMatches = [];
    if (keywords.length > 0 || budget) {
      relevantManualMatches = MANUAL_RESTAURANTS.filter(r => {
        // Keyword Match
        const lowerKw = keywords.map(k => k.toLowerCase());
        let nameMatch = false;
        let menuMatch = false;

        if (keywords.length > 0) {
          nameMatch = lowerKw.some(k => r.name.toLowerCase().includes(k) || r.cuisine.toLowerCase().includes(k));
          menuMatch = r.menu.some(m => lowerKw.some(k => m.name.toLowerCase().includes(k) || m.category.toLowerCase().includes(k)));
        }

        // Budget Match
        let budgetMatchFound = false;
        if (budget) {
          budgetMatchFound = r.menu.some(m => m.price <= budget);
        }

        return nameMatch || menuMatch || budgetMatchFound;
      }).slice(0, 5); // Increased to 5 to catch budget options
    } else {
      relevantManualMatches = MANUAL_RESTAURANTS.slice(0, 3);
    }

    // 4. Build Rich Context
    let contextData = "### REGISTERED RESTAURANTS:\n";
    restaurants.forEach(r => {
      if (r.restaurantDetails) {
        contextData += `- ${r.restaurantDetails.businessName} (${r.restaurantDetails.cuisine}) in ${r.restaurantDetails.location}.\n`;
      }
    });

    contextData += "\n### POPULAR LOCAL SPOTS (External):\n";
    relevantManualMatches.forEach(r => {
      contextData += `- **${r.name}** (${r.cuisine}) in ${r.address}. Famous For: ${r.description}\n`;
      contextData += `  *Menu Highlights*:\n`;
      r.menu.forEach(m => {
        contextData += `   - ${m.name} (Rs. ${m.price}): ${m.description}\n`;
      });
      contextData += "\n";
    });

    // 5. PROCESS DEALS (DB + MANUAL)
    let allDeals = [];

    // Add DB Deals
    activeDeals.forEach(d => {
      if (d.restaurant?.restaurantDetails) {
        allDeals.push({
          title: d.title,
          restaurant: d.restaurant.restaurantDetails.businessName,
          price: d.dealPrice,
          originalPrice: d.originalPrice,
          description: d.description
        });
      }
    });

    // Add Manual Deals
    MANUAL_DEALS.forEach(d => {
      allDeals.push({
        title: d.title,
        restaurant: d.restaurant,
        price: d.price,
        originalPrice: null,
        description: d.description
      });
    });

    // Filter Deals by Budget
    if (budget) {
      allDeals = allDeals.filter(d => d.price <= budget);
    }

    contextData += "\n### ACTIVE DEALS (Best Value):\n";
    if (allDeals.length > 0) {
      allDeals.forEach(d => {
        contextData += `- DEAL: "${d.title}" at ${d.restaurant}. Price: Rs. ${d.price}${d.originalPrice ? ` (Original: ${d.originalPrice})` : ''}. ${d.description}\n`;
      });
    } else {
      contextData += "No specific deals found within these criteria.\n";
    }

    contextData += "\n### MENU ITEMS (From Matches):\n";
    const seenItems = new Set();
    relevantItems.forEach(m => {
      if (m.restaurant?.restaurantDetails && !seenItems.has(m._id.toString())) {
        const r = m.restaurant.restaurantDetails;
        contextData += `- Item: "${m.name}" (${m.category}) at ${r.businessName}. Price: Rs. ${m.price}. Description: ${m.description}\n`;
        seenItems.add(m._id.toString());
      }
    });

    if (relevantItems.length === 0 && relevantManualMatches.length === 0) {
      contextData += "No specific matches found for this query in our database. Rely on general food knowledge tailored to Lahore.\n";
    }

    // 5. Construct Intelligent System Prompt
    const systemPrompt = `You are FoodieAI, a smart and helpful food assistant for Lahore.
    User Location: "${userLocation || "Lahore"}".
    
    CORE TASKS:
    1. **Search & Match**: Use the relevant "Menu Items" and "Popular Local Spots" provided below. Matches were based on user keywords.
    2. **External/Manual Listings**: You have access to a list of famous Lahore spots (e.g. Haveli, Butt Karahi). USE THEM extensively if they fit the query.
    3. **Budget Matching**: "Under 1000", "Cheap", etc. -> Filter strictly by price.
    4. **Craving Analysis**: "Spicy", "Desi", etc. -> Match descriptions.
    
    RESPONSE GUIDELINES:
    - **Be Specific**: Don't just say "we have options". Say "Haveli offers Mutton Chops for 2800".
    - **No Hallucinations**: Only recommend items listed in the "Context Data" below. If something isn't there, say "I don't see that on our current menus, but typically..."
    - **Format**: Use simple bullet points. Avoid complex markdown tables.
    
    CONTEXT DATA:
    ${contextData}
    `;

    // 6. PREPARE RECOMMENDATIONS FOR FRONTEND (Buttons)
    const recommendedItems = [];

    // Prioritize Deals
    if (allDeals.length > 0) {
      allDeals.slice(0, 3).forEach(d => {
        recommendedItems.push({
          type: 'deal',
          title: d.title,
          subtitle: d.restaurant,
          price: d.price,
          description: d.description
        });
      });
    }

    // Add Menu Items if space permits
    if (recommendedItems.length < 5) {

      // Manual Matches
      relevantManualMatches.forEach(r => {
        r.menu.forEach(m => {
          if (recommendedItems.length < 5 && (!budget || m.price <= budget)) {
            // Simple text match check if keywords exist
            const isRelevant = keywords.length === 0 || keywords.some(k => m.name.toLowerCase().includes(k.toLowerCase()) || m.category.toLowerCase().includes(k.toLowerCase()));

            if (isRelevant) {
              recommendedItems.push({
                type: 'item',
                title: m.name,
                subtitle: r.name,
                price: m.price,
                description: m.description
              });
            }
          }
        });
      });

      // DB Matches
      if (recommendedItems.length < 5) {
        relevantItems.forEach(m => {
          if (recommendedItems.length < 5) {
            recommendedItems.push({
              type: 'item',
              title: m.name,
              subtitle: m.restaurant?.restaurantDetails?.businessName || "Restaurant",
              price: m.price,
              description: m.description
            });
          }
        });
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Model strategy: Use available Gemini 2.5/2.0 models
    let modelName = "gemini-2.5-flash";

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt
      });
      const result = await model.generateContent(message);
      const response = await result.response;
      const reply = response.text();

      res.status(200).json({ success: true, reply: reply, modelUsed: modelName, recommendedItems });

    } catch (firstError) {
      console.warn(`Primary model ${modelName} failed: ${firstError.message}. Retrying with fallback...`);

      try {
        // Fallback to gemini-2.0-flash
        modelName = "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const reply = response.text();

        res.status(200).json({ success: true, reply: reply, modelUsed: modelName, recommendedItems });

      } catch (secondError) {
        console.error("All AI models failed:", secondError.message);
        throw secondError; // Propagate to main catch
      }
    }

  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({
      success: false,
      message: "I'm having a bit of trouble connecting to the network.",
      error: error.message
    });
  }
};

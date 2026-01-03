import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Explicitly use the key provided by the user if it's not in env correctly, 
// but better to test the env loading too.
const API_KEY = process.env.OPENROUTER_API_KEY || "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";

async function testConnection() {
  console.log("Testing OpenRouter Connection...");
  console.log("Key being used:", API_KEY ? `${API_KEY.substring(0, 10)}...` : "None");

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        { role: "user", content: "Say hello!" }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "FoodieApp Test",
        "Content-Type": "application/json"
      }
    });

    console.log("Success!");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  } catch (error) {
    console.error("Failed!");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
  }
}

testConnection();

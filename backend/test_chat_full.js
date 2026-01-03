
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { chatWithAI } from './controllers/aiController.js';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is missing from env");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongodb connected for test.");
  } catch (error) {
    console.error("DB Connection Error:", error);
    process.exit(1);
  }
};

const runTest = async () => {
  await connectDB();

  const req = {
    body: {
      message: "I want some spicy food in Gulberg",
      userLocation: "Lahore"
    }
  };

  const res = {
    status: (code) => {
      console.log(`[Response Status]: ${code}`);
      return res;
    },
    json: (data) => {
      console.log(`[Response JSON]:`, JSON.stringify(data, null, 2));
      process.exit(0); // Exit after response
    }
  };

  console.log("Calling chatWithAI...");
  await chatWithAI(req, res);
};

runTest();

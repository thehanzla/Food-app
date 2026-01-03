
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Note: There isn't a direct listModels wrapper in the high-level genAI object in some versions,
  // but we can try to use the underlying API or just test a few names.

  // Using the model manager if available (depending on SDK version)
  // For ^0.2.0 it might not be exposed easily.

  const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];

  for (const modelName of modelsToTest) {
    console.log(`Testing model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      console.log(`SUCCESS: ${modelName} works!`);
      console.log(result.response.text());
      return; // specific one found
    } catch (e) {
      console.log(`FAILED: ${modelName} - ${e.message}`);
    }
  }
}

listModels();

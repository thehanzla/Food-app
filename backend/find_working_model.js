
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const modelsToTest = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro-001",
  "gemini-pro",
  "gemini-1.0-pro"
];

async function testModels() {
  console.log("Initializing Gemini Client...");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  for (const modelName of modelsToTest) {
    process.stdout.write(`Testing ${modelName}... `);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hi");
      const response = await result.response;
      console.log(`SUCCESS! Response: ${response.text()}`);
      process.exit(0); // Exit on first success to save time
    } catch (error) {
      console.log(`FAILED. (${error.message.split(']')[1] || error.message})`);
    }
  }
  console.log("All models failed.");
}

testModels();

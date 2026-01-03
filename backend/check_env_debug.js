
import dotenv from 'dotenv';
dotenv.config();

console.log("Checking Environment Variables...");
if (process.env.GEMINI_API_KEY) {
  console.log("GEMINI_API_KEY is present.");
  console.log("Key length:", process.env.GEMINI_API_KEY.length);
  if (process.env.GEMINI_API_KEY.length > 20) {
    console.log("Key looks reasonably long.");
  } else {
    console.log("Key looks too short.");
  }
} else {
  console.log("GEMINI_API_KEY is MISSING.");
}

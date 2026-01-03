import express from 'express'
import connectDB from './config/db.js'
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js'
import cors from 'cors'
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser'; // 1. Import this

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MANUAL CORS PREFLIGHT HANDLING
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// CORS middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://food-app-two-ruby.vercel.app',
  'https://food-ewjfdc1sa-thehanzlas-projects.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowedOrigins OR if it's a Vercel preview deployment
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Debug Middleware: Log all requests
app.use((req, res, next) => {
  console.log(`[SERVER] Received Request: ${req.method} ${req.url}`);
  next();
});

// Connect to DB asynchronously (don't await at top level to avoid startup delay/crash)
connectDB().catch(err => console.error("Top-level DB connection error:", err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Root Route for Health Check
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/location', locationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

const PORT = process.env.PORT || 5000

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("Server is running at port: ", PORT);
  });
}

export default app;
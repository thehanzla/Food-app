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

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Debug Middleware: Log all requests
app.use((req, res, next) => {
  console.log(`[SERVER] Received Request: ${req.method} ${req.url}`);
  next();
});

connectDB();

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
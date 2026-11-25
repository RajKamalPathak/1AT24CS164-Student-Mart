const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const productsSeed = require('./data/productsData');
const { ensureDefaultUsers } = require('./seeder');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Connect to MongoDB (Local or Aiven Cloud) & Auto-Seed fresh database
connectDB().then(async (conn) => {
  if (!conn) return;
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Auto-Seed] Initializing catalog with student stationery & supplies...');
      await Product.insertMany(productsSeed);
      console.log(`[Auto-Seed] Inserted ${productsSeed.length} student mart products!`);
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    const studentCount = await User.countDocuments({ role: 'student' });
    if (adminCount === 0 || studentCount === 0) {
      await ensureDefaultUsers();
    }
  } catch (err) {
    console.error('[Auto-Seed Error]', err.message);
  }
});

// Flexible CORS for Local Development & Vercel <-> Render Production
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...envOrigins,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      const isVercelPreview = cleanOrigin.endsWith('.vercel.app');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        isVercelPreview ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      // Allow configured origin or fallback cleanly
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));

// Request logger for debugging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check & MongoDB status endpoint
app.get('/api/health', (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    status: 'online',
    appName: 'Student Mart API',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'student_mart',
      host: mongoose.connection.host || 'localhost',
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Student Mart API - College Stationery & Admin Portal',
    status: 'active',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      user: '/api/user',
      cards: '/api/cards',
      orders: '/api/orders',
      admin: '/api/admin',
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Student Mart Server running on port ${PORT}`);
  console.log(` Base API: http://localhost:${PORT}/api/products`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

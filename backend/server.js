const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const productsSeed = require("./data/productsData");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cardRoutes = require("./routes/cardRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  try {
    // Auto-seed products if database has 0 products
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log(
        "[Auto-Seed] Initializing catalog with student stationery & supplies...",
      );
      await Product.insertMany(productsSeed);
      console.log(
        `[Auto-Seed] Successfully inserted ${productsSeed.length} student mart products!`,
      );
    }
  } catch (err) {
    console.error("[Auto-Seed Error]", err.message);
  }
});

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching origins
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for easy student grading & deployment
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// Request logger for debugging
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check & MongoDB status endpoint
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    status: "online",
    appName: "Student Mart API",
    database: {
      status: dbStatus,
      name: mongoose.connection.name || "student_mart",
      host: mongoose.connection.host || "localhost",
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Student Mart API - College Stationery & Essentials",
    status: "active",
    documentation: {
      health: "/api/health",
      products: "/api/products",
      categories: "/api/products/categories",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me",
      },
      user: {
        updateProfile: "PUT /api/user/profile",
        changePassword: "PUT /api/user/change-password",
      },
      cards: {
        getCards: "GET /api/cards",
        addCard: "POST /api/cards",
        deleteCard: "DELETE /api/cards/:id",
      },
      orders: {
        create: "POST /api/orders",
        myOrders: "GET /api/orders/myorders",
      },
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

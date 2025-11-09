require("dotenv").config();
const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const userRoutes = require("./routes/user.routes");
const messageRoutes = require("./routes/message.routes");
const statsRoutes = require("./routes/stats.routes");
const paymentRoutes = require("./routes/payment.routes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

// Import initialization scripts
const {
  initializeAchievements,
  initializeUserAchievements,
} = require("./scripts/initAchievements");

const app = express();

// Middleware

// Simple request logging
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `New request ${req.method} ${req.originalUrl} -> ${res.statusCode}`
    );
  });
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "merrytext-express",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/merrytext/api/v1/user", userRoutes);
app.use("/merrytext/api/v1/message", messageRoutes);
app.use("/merrytext/api/v1/stats", statsRoutes);
app.use("/merrytext/api/v1/payment", paymentRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Initialize database connection and achievements
let isInitialized = false;
let initPromise = null;

const initialize = async () => {
  // If initialization is already in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // If already initialized, return immediately
  if (isInitialized) {
    return Promise.resolve();
  }

  // Start initialization
  initPromise = (async () => {
    try {
      console.log("🔌 Connecting to MongoDB...");
      await connectDB();

      console.log("🎯 Initializing achievements system...");
      await initializeAchievements();
      await initializeUserAchievements();

      isInitialized = true;
      console.log("✅ Initialization complete");
    } catch (error) {
      console.error("❌ Initialization failed:", error.message);
      initPromise = null; // Reset so it can retry
      throw error;
    }
  })();

  return initPromise;
};

// For Vercel serverless functions
if (process.env.VERCEL) {
  console.log("🚀 Running in Vercel serverless mode");

  // Pre-initialize on module load (happens once per cold start)
  const warmup = initialize().catch((err) => {
    console.error("⚠️ Warmup initialization failed:", err.message);
  });

  // Ensure initialization before handling requests
  app.use(async (req, res, next) => {
    try {
      // Wait for warmup to complete
      await warmup;

      // Double-check initialization
      if (!isInitialized) {
        console.log("🔄 Re-attempting initialization...");
        await initialize();
      }

      next();
    } catch (err) {
      console.error("❌ Failed to initialize:", err.message);
      res.status(503).json({
        success: false,
        error: "Service temporarily unavailable. Database connection failed.",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  });
} else {
  // For local development
  console.log("🏠 Running in local development mode");
  connectDB()
    .then(async () => {
      await initialize();
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to connect to MongoDB:", err.message);
      process.exit(1);
    });
}

module.exports = app;

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

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

module.exports = app;

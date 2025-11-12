const mongoose = require("mongoose");

// Disable buffering globally - we'll ensure connection before queries
mongoose.set("bufferCommands", true);

// Cache the connection for serverless environments
let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  try {
    // Return cached connection if it exists and is ready
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // If connection is in progress, wait for it
    if (connectionPromise) {
      console.log("⏳ Waiting for existing connection attempt...");
      return connectionPromise;
    }

    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/merrytext";

    console.log("🔌 Initiating MongoDB connection...");

    const options = {
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    // If already connected, return existing connection
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    // If connecting, wait for it
    if (mongoose.connection.readyState === 2) {
      console.log("⏳ MongoDB connection in progress...");
      connectionPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 15000);

        mongoose.connection.once("connected", () => {
          clearTimeout(timeout);
          cachedConnection = mongoose.connection;
          connectionPromise = null;
          resolve(cachedConnection);
        });
        mongoose.connection.once("error", (err) => {
          clearTimeout(timeout);
          connectionPromise = null;
          reject(err);
        });
      });
      return connectionPromise;
    }

    // Create new connection
    connectionPromise = mongoose.connect(uri, options);
    await connectionPromise;

    cachedConnection = mongoose.connection;
    connectionPromise = null;

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    cachedConnection = null;
    connectionPromise = null;
    throw error;
  }
};

module.exports = connectDB;

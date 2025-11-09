const mongoose = require("mongoose");

// Cache the connection for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if it exists and is ready
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/merrytext";

    const options = {
      bufferCommands: false, // Disable buffering for faster failure
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    // If already connected, return existing connection
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    // If connecting, wait for it
    if (mongoose.connection.readyState === 2) {
      console.log("⏳ MongoDB connection in progress...");
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    // Create new connection
    await mongoose.connect(uri, options);
    cachedConnection = mongoose.connection;
    console.log("✅ MongoDB connected successfully");

    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    cachedConnection = null;
    throw error;
  }
};

module.exports = connectDB;

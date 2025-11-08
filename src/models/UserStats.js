const mongoose = require("mongoose");

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalMessagesSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMessagesViewed: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCoinsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCoinsSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueRecipients: {
      type: Number,
      default: 0,
      min: 0,
    },
    messagesViewedToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageDate: {
      type: Date,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userStatsSchema.index({ userId: 1 });

module.exports = mongoose.model("UserStats", userStatsSchema);

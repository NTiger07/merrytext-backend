const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "🏆",
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      enum: ["messaging", "social", "coins", "speed"],
      required: true,
    },
    xpReward: {
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
achievementSchema.index({ category: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);

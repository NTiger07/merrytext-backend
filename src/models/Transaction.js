const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    ownerUsername: {
      type: String,
      required: true,
      trim: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // in cents
    },
    coinsPurchased: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ ownerUsername: 1 });
transactionSchema.index({ stripePaymentIntentId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);

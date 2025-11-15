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
    type: {
      type: String,
      enum: ["purchase", "spending"],
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true, // Only required for purchases
    },
    amount: {
      type: Number,
      min: 0, // in cents (only for purchases)
    },
    coins: {
      type: Number,
      required: true,
      min: 0,
    },
    // Legacy field for backward compatibility
    coinsPurchased: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    completedAt: {
      type: Date,
    },
    // For spending transactions
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ ownerUsername: 1 });
transactionSchema.index({ stripePaymentIntentId: 1 }, { sparse: true }); // Sparse index to allow multiple nulls
transactionSchema.index({ status: 1 });

// Post-save hook to add transaction reference to user
transactionSchema.post("save", async function (doc) {
  try {
    const User = mongoose.model("User");
    await User.findOneAndUpdate(
      { username: doc.ownerUsername },
      { $addToSet: { transactions: doc._id } }
    );
  } catch (error) {
    console.error("Error updating user transactions:", error);
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);

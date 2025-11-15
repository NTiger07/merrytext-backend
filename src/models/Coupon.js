const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["time-based", "user-based"],
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed-coins"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // For time-based coupons
    expiresAt: {
      type: Date,
      required: function () {
        return this.type === "time-based";
      },
    },
    // For user-based coupons
    maxUsers: {
      type: Number,
      min: 1,
      required: function () {
        return this.type === "user-based";
      },
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        username: {
          type: String,
          required: true,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
    minPurchaseAmount: {
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
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ type: 1 });
couponSchema.index({ expiresAt: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
  if (!this.isActive) return false;

  // Check time-based expiration
  if (this.type === "time-based" && this.expiresAt < new Date()) {
    return false;
  }

  // Check user-based limit
  if (this.type === "user-based" && this.usedCount >= this.maxUsers) {
    return false;
  }

  return true;
};

// Method to check if user already used this coupon
couponSchema.methods.hasUserUsed = function (username) {
  return this.usedBy.some((usage) => usage.username === username);
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (amount) {
  if (this.discountType === "percentage") {
    return Math.floor((amount * this.discountValue) / 100);
  } else {
    // fixed-coins
    return this.discountValue;
  }
};

module.exports = mongoose.model("Coupon", couponSchema);

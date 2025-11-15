const Coupon = require("../models/Coupon");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Create a new coupon (Admin function)
 */
exports.createCoupon = async (req, res) => {
  const {
    code,
    description,
    type,
    discountType,
    discountValue,
    expiresAt,
    maxUsers,
    minPurchaseAmount,
    createdBy,
  } = req.body;

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return res
      .status(400)
      .json(ApiResponse.error("Coupon code already exists"));
  }

  // Create coupon data
  const couponData = {
    code: code.toUpperCase(),
    description,
    type,
    discountType,
    discountValue,
    minPurchaseAmount: minPurchaseAmount || 0,
    createdBy: createdBy || "admin",
  };

  // Add type-specific fields
  if (type === "time-based") {
    if (!expiresAt) {
      return res
        .status(400)
        .json(
          ApiResponse.error("expiresAt is required for time-based coupons")
        );
    }
    couponData.expiresAt = new Date(expiresAt);
  } else if (type === "user-based") {
    if (!maxUsers) {
      return res
        .status(400)
        .json(ApiResponse.error("maxUsers is required for user-based coupons"));
    }
    couponData.maxUsers = maxUsers;
  }

  const coupon = await Coupon.create(couponData);

  res
    .status(201)
    .json(ApiResponse.success(coupon, "Coupon created successfully"));
};

/**
 * Get all coupons
 */
exports.getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(ApiResponse.success(coupons));
};

/**
 * Get active coupons only
 */
exports.getActiveCoupons = async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    $or: [
      { type: "user-based", $expr: { $lt: ["$usedCount", "$maxUsers"] } },
      { type: "time-based", expiresAt: { $gt: now } },
    ],
  }).sort({ createdAt: -1 });

  res.json(ApiResponse.success(coupons));
};

/**
 * Validate and apply coupon
 */
exports.validateCoupon = async (req, res) => {
  const { code, username, purchaseAmount } = req.body;

  if (!code || !username) {
    return res
      .status(400)
      .json(ApiResponse.error("Coupon code and username are required"));
  }

  // Find coupon
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json(ApiResponse.error("Coupon not found"));
  }

  // Check if coupon is valid
  if (!coupon.isValid()) {
    return res
      .status(400)
      .json(ApiResponse.error("Coupon has expired or reached usage limit"));
  }

  // Check if user already used this coupon
  if (coupon.hasUserUsed(username)) {
    return res
      .status(400)
      .json(ApiResponse.error("You have already used this coupon"));
  }

  // Check minimum purchase amount
  if (purchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
    return res
      .status(400)
      .json(
        ApiResponse.error(
          `Minimum purchase amount is ${coupon.minPurchaseAmount} coins`
        )
      );
  }

  // Calculate discount
  const discount = purchaseAmount
    ? coupon.calculateDiscount(purchaseAmount)
    : 0;

  const response = {
    valid: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    discount,
    message: "Coupon is valid",
  };

  res.json(ApiResponse.success(response));
};

/**
 * Apply coupon (mark as used)
 */
exports.applyCoupon = async (req, res) => {
  const { code, username } = req.body;

  if (!code || !username) {
    return res
      .status(400)
      .json(ApiResponse.error("Coupon code and username are required"));
  }

  // Find user
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  // Find coupon
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json(ApiResponse.error("Coupon not found"));
  }

  // Check if coupon is valid
  if (!coupon.isValid()) {
    return res
      .status(400)
      .json(ApiResponse.error("Coupon has expired or reached usage limit"));
  }

  // Check if user already used this coupon
  if (coupon.hasUserUsed(username)) {
    return res
      .status(400)
      .json(ApiResponse.error("You have already used this coupon"));
  }

  // Mark coupon as used with atomic update
  const updatedCoupon = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    {
      $push: { usedBy: { username: username, usedAt: new Date() } },
      $inc: { usedCount: 1 },
    },
    { new: true }
  );

  const response = {
    coupon: {
      code: updatedCoupon.code,
      description: updatedCoupon.description,
      usedCount: updatedCoupon.usedCount,
      maxUsers: updatedCoupon.maxUsers,
    },
    message: "Coupon applied successfully",
  };

  res.json(ApiResponse.success(response));
};

/**
 * Increment coupon usage manually (Admin only)
 */
exports.incrementCouponUsage = async (req, res) => {
  const { code } = req.params;
  const { username, amount } = req.body;

  if (!username) {
    return res.status(400).json(ApiResponse.error("Username is required"));
  }

  const incrementAmount = amount || 1;

  // Find coupon
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json(ApiResponse.error("Coupon not found"));
  }

  // Increment usage
  const updatedCoupon = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    {
      $push: { usedBy: { username: username, usedAt: new Date() } },
      $inc: { usedCount: incrementAmount },
    },
    { new: true }
  );

  const response = {
    coupon: {
      code: updatedCoupon.code,
      description: updatedCoupon.description,
      usedCount: updatedCoupon.usedCount,
      maxUsers: updatedCoupon.maxUsers,
    },
    message: `Coupon usage incremented by ${incrementAmount}`,
  };

  res.json(ApiResponse.success(response));
};

/**
 * Activate coupon
 */
exports.activateCoupon = async (req, res) => {
  const { code } = req.params;

  const coupon = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { isActive: true },
    { new: true }
  );

  if (!coupon) {
    return res.status(404).json(ApiResponse.error("Coupon not found"));
  }

  res.json(ApiResponse.success(coupon, "Coupon activated successfully"));
};

/**
 * Deactivate coupon
 */
exports.deactivateCoupon = async (req, res) => {
  const { code } = req.params;

  const coupon = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { isActive: false },
    { new: true }
  );

  if (!coupon) {
    return res.status(404).json(ApiResponse.error("Coupon not found"));
  }

  res.json(ApiResponse.success(coupon, "Coupon deactivated successfully"));
};

/**
 * Delete coupon
 */
exports.deleteCoupon = async (req, res) => {
  const { code } = req.params;

  const coupon = await Coupon.findOneAndDelete({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json(ApiResponse.error("Coupon not found"));
  }

  res.json(ApiResponse.success(null, "Coupon deleted successfully"));
};

/**
 * Get coupon by code
 */
exports.getCouponByCode = async (req, res) => {
  const { code } = req.params;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return res.status(404).json(ApiResponse.error("Coupon not found"));
  }

  res.json(ApiResponse.success(coupon));
};

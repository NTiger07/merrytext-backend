const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/adminAuth");
const {
  createCoupon,
  validateCoupon,
  applyCoupon,
} = require("../validators/schemas");

// Create a new coupon (Admin only)
router.post(
  "/",
  requireAdmin,
  validate(createCoupon),
  couponController.createCoupon
);

// Get all coupons (Admin only)
router.get("/", requireAdmin, couponController.getAllCoupons);

// Get active coupons (Admin only)
router.get("/active", requireAdmin, couponController.getActiveCoupons);

// Get coupon by code (Admin only)
router.get("/:code", requireAdmin, couponController.getCouponByCode);

// Validate coupon (Admin only)
router.post(
  "/validate",
  requireAdmin,
  validate(validateCoupon),
  couponController.validateCoupon
);

// Apply coupon (Admin only)
router.post(
  "/apply",
  requireAdmin,
  validate(applyCoupon),
  couponController.applyCoupon
);

// Deactivate coupon (Admin only)
router.patch(
  "/:code/deactivate",
  requireAdmin,
  couponController.deactivateCoupon
);

// Delete coupon (Admin only)
router.delete("/:code", requireAdmin, couponController.deleteCoupon);

module.exports = router;

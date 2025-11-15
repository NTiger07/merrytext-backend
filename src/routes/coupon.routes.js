const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");
const { validate } = require("../middleware/validate");
const {
  createCoupon,
  validateCoupon,
  applyCoupon,
} = require("../validators/schemas");

// Create a new coupon (Admin)
router.post("/", validate(createCoupon), couponController.createCoupon);

// Get all coupons
router.get("/", couponController.getAllCoupons);

// Get active coupons
router.get("/active", couponController.getActiveCoupons);

// Get coupon by code
router.get("/:code", couponController.getCouponByCode);

// Validate coupon
router.post(
  "/validate",
  validate(validateCoupon),
  couponController.validateCoupon
);

// Apply coupon
router.post("/apply", validate(applyCoupon), couponController.applyCoupon);

// Deactivate coupon
router.patch("/:code/deactivate", couponController.deactivateCoupon);

// Delete coupon
router.delete("/:code", couponController.deleteCoupon);

module.exports = router;

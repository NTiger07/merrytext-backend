const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Payment routes
router.post(
  "/create-checkout-session",
  paymentController.createCheckoutSession
);

// Stripe webhook - receives raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

module.exports = router;

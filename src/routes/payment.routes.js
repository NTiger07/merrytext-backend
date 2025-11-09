const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Payment routes
router.post(
  "/create-checkout-session",
  paymentController.createCheckoutSession
);

// Verify payment session
router.get(
  "/verify-session/:sessionId",
  paymentController.verifyPaymentSession
);

// Stripe webhook - receives raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

module.exports = router;

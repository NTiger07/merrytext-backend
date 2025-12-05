const express = require("express");
const rateLimit = require("express-rate-limit");
const { generateAIMessage } = require("../controllers/ai.controller");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Rate limiter for AI generation endpoints
// 10 requests per minute per user
const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    success: false,
    error: "Too many AI generation requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use user ID if authenticated, otherwise fall back to IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

/**
 * @route   POST /api/ai/generate-message
 * @desc    Generate AI-powered message using Google Gemini
 * @access  Public (authentication optional for rate limiting by user)
 * @body    { templateType, prompt?, friendInfo? }
 */
router.post("/generate-message", aiGenerationLimiter, generateAIMessage);

module.exports = router;

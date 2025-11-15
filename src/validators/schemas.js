const Joi = require("joi");

// User registration validation
exports.registerUser = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  name: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(6).max(100),
  authProvider: Joi.string().valid("google", "apple", "email"),
});

// User update validation
exports.updateUser = Joi.object({
  name: Joi.string().min(2).max(100),
  profilePicture: Joi.string().uri(),
});

// Message creation validation
exports.createMessage = Joi.object({
  ownerEmail: Joi.string().email().required(),
  ownerUsername: Joi.string().required(),
  templateType: Joi.string()
    .valid(
      "MEMORY LANE SLIDESHOW",
      "FIREPLACE CHAT",
      "CONFETTI CANNON COUNTDOWN",
      "GRATITUDE JAR",
      "PERSONALIZED CAROL"
    )
    .required(),
  personalizedText: Joi.string().min(1).max(5000).required(),
  recipientName: Joi.string().min(1).max(200),
  isMultipleRecipients: Joi.boolean(),
  countdownDate: Joi.date().iso().when("templateType", {
    is: "CONFETTI CANNON COUNTDOWN",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  mediaUrls: Joi.array().items(Joi.string().uri()),
  mediaType: Joi.array().items(Joi.string()),
});

// Message edit validation
exports.editMessage = Joi.object({
  templateType: Joi.string().valid(
    "MEMORY LANE SLIDESHOW",
    "FIREPLACE CHAT",
    "CONFETTI CANNON COUNTDOWN",
    "GRATITUDE JAR",
    "PERSONALIZED CAROL"
  ),
  personalizedText: Joi.string().min(1).max(5000),
  recipientName: Joi.string().min(1).max(200).allow(null),
  isMultipleRecipients: Joi.boolean(),
  countdownDate: Joi.date().iso().when("templateType", {
    is: "CONFETTI CANNON COUNTDOWN",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  mediaUrls: Joi.array().items(Joi.string().uri()),
  mediaType: Joi.array().items(Joi.string()),
});

// Payment validation
exports.createCheckoutSession = Joi.object({
  ownerUsername: Joi.string().required(),
  ownerEmail: Joi.string().email().required(),
  amount: Joi.number().integer().min(1).required(),
  coins: Joi.number().integer().min(1).required(),
  priceId: Joi.string(),
});

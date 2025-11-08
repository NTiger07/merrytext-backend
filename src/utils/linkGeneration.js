const crypto = require("crypto");

/**
 * Generate a unique URL for a message
 */
const generateMessageUrl = () => {
  return crypto.randomBytes(8).toString("hex");
};

/**
 * Generate full view URL
 */
const getFullViewUrl = (messageUrl) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}/view/${messageUrl}`;
};

/**
 * Generate shareable text for WhatsApp, etc.
 */
const generateShareableText = (user, messageUrl) => {
  const fullUrl = getFullViewUrl(messageUrl);
  return `${user.name} sent you a special message! 🎉 Open it here: ${fullUrl}`;
};

module.exports = {
  generateMessageUrl,
  getFullViewUrl,
  generateShareableText,
};

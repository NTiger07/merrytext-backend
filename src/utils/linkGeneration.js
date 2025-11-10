const crypto = require("crypto");

/**
 * Generate a unique URL for a message
 * Returns 7 alphanumeric characters (uppercase and lowercase)
 */
const generateMessageUrl = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomBytes = crypto.randomBytes(7);

  for (let i = 0; i < 7; i++) {
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
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

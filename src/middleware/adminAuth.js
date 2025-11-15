const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

// List of admin emails
const ADMIN_EMAILS = [
  "simipeterss@gmail.com",
  "merrytext@gmail.com",
  "falaleru@gmail.com",
  "olalerufavour@gmail.com",
];

/**
 * Middleware to check if user is an admin
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    const { email, username } = req.body;

    // Check if email or username is provided
    if (!email && !username) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            "Email or username is required for admin verification"
          )
        );
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res.status(404).json(ApiResponse.error("User not found"));
    }

    // Check if user email is in admin list
    if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return res
        .status(403)
        .json(ApiResponse.error("Access denied. Admin privileges required."));
    }

    // Attach user to request for use in controller
    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json(ApiResponse.error("Failed to verify admin access"));
  }
};

/**
 * Check if an email is an admin (utility function)
 */
exports.isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Get list of admin emails (for reference only)
 */
exports.getAdminEmails = () => {
  return [...ADMIN_EMAILS];
};

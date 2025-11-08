const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(ApiResponse.success(users));
};

/**
 * Get user by username
 */
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("-password");

  if (!user) {
    return res
      .status(404)
      .json(ApiResponse.error(`User with username '${username}' not found`));
  }

  res.json(ApiResponse.success(user));
};

/**
 * Register a new user
 */
exports.registerUser = async (req, res) => {
  const { email, username, name, password, authProvider } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    return res
      .status(400)
      .json(
        ApiResponse.error("User with this email or username already exists")
      );
  }

  // Create new user
  const user = await User.create({
    email,
    username,
    name,
    password,
    authProvider: authProvider || "email",
    merryCoins: 100, // Starting coins
    totalXp: 0,
    level: 1,
  });

  // Don't send password in response
  const userResponse = user.toObject();
  delete userResponse.password;

  res
    .status(201)
    .json(ApiResponse.success(userResponse, "User registered successfully"));
};

/**
 * Update user profile
 */
exports.updateUser = async (req, res) => {
  const { username } = req.params;
  const updates = req.body;

  // Don't allow updating sensitive fields directly
  delete updates.password;
  delete updates.merryCoins;
  delete updates.totalXp;
  delete updates.level;

  const user = await User.findOneAndUpdate({ username }, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  res.json(ApiResponse.success(user, "User updated successfully"));
};

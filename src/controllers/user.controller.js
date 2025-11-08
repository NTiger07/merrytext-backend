const User = require("../models/User");
const Message = require("../models/Message");
const Transaction = require("../models/Transaction");
const ApiResponse = require("../utils/ApiResponse");
const {
  initializeUserAchievementsForUser,
} = require("../scripts/initAchievements");

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password")
    .populate("achievements.achievementId");
  res.json(ApiResponse.success(users));
};

/**
 * Get user by username
 */
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username })
    .select("-password")
    .populate("achievements.achievementId");

  if (!user) {
    return res
      .status(404)
      .json(ApiResponse.error(`User with username '${username}' not found`));
  }

  // Fetch user's messages
  const messages = await Message.find({ ownerUsername: username }).sort({
    createdAt: -1,
  });

  // Fetch user's transactions
  const transactions = await Transaction.find({ ownerUsername: username }).sort(
    {
      createdAt: -1,
    }
  );

  // Construct response with user, messages, and transactions
  const response = {
    ...user.toObject(),
    messages,
    transactions,
  };

  res.json(ApiResponse.success(response));
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

  // Initialize achievements for new user
  await initializeUserAchievementsForUser(user._id);

  // Fetch user with populated achievements
  const populatedUser = await User.findById(user._id)
    .select("-password")
    .populate("achievements.achievementId");

  // Fetch initial empty arrays for messages and transactions
  const messages = await Message.find({ ownerUsername: username });
  const transactions = await Transaction.find({ ownerUsername: username });

  // Construct response
  const response = {
    ...populatedUser.toObject(),
    messages,
    transactions,
  };

  res
    .status(201)
    .json(ApiResponse.success(response, "User registered successfully"));
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
  })
    .select("-password")
    .populate("achievements.achievementId");

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  res.json(ApiResponse.success(user, "User updated successfully"));
};

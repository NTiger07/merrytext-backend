const User = require("../models/User");
const Message = require("../models/Message");
const Transaction = require("../models/Transaction");
const ApiResponse = require("../utils/ApiResponse");
const { generateToken } = require("../utils/jwt");
const { OAuth2Client } = require("google-auth-library");
const {
  initializeUserAchievementsForUser,
} = require("../scripts/initAchievements");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    merryCoins: 50, // Starting coins
    totalXp: 0,
    level: 1,
  });

  // Initialize achievements for new user
  await initializeUserAchievementsForUser(user._id);

  // Create transaction for initial coins
  await Transaction.create({
    ownerUsername: user.username,
    ownerEmail: user.email,
    type: "purchase",
    coins: 50,
    coinsPurchased: 50,
    status: "completed",
    completedAt: new Date(),
    description: "Welcome bonus - Initial coins",
  });

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
 * Login user with email/username and password
 */
exports.loginUser = async (req, res) => {
  const { username_email, password } = req.body;

  // Validate input
  if (!username_email || !password) {
    return res
      .status(400)
      .json(ApiResponse.error("Username/email and password are required"));
  }

  // Find user by email or username and include password field
  const user = await User.findOne({
    $or: [{ email: username_email }, { username: username_email }],
  }).select("+password");

  if (!user) {
    return res.status(401).json(ApiResponse.error("Invalid credentials"));
  }

  // Check if user registered with email/password
  if (user.authProvider !== "email") {
    return res
      .status(400)
      .json(
        ApiResponse.error(
          `Please login using ${user.authProvider} authentication`
        )
      );
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json(ApiResponse.error("Invalid credentials"));
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Fetch user with populated achievements
  const populatedUser = await User.findById(user._id)
    .select("-password")
    .populate("achievements.achievementId");

  // Fetch user's messages and transactions
  const messages = await Message.find({ ownerUsername: user.username }).sort({
    createdAt: -1,
  });
  const transactions = await Transaction.find({
    ownerUsername: user.username,
  }).sort({
    createdAt: -1,
  });

  // Construct response
  const response = {
    ...populatedUser.toObject(),
    messages,
    transactions,
    token,
  };

  res.json(ApiResponse.success(response, "Login successful"));
};

/**
 * Google OAuth login
 */
exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res
      .status(400)
      .json(ApiResponse.error("Google ID token is required"));
  }

  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        user.emailVerified = email_verified;
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
      }
    } else {
      // Create new user
      // Generate username from email
      const baseUsername = email.split("@")[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;

      // Ensure username is unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        email,
        username,
        name,
        authProvider: "google",
        googleId,
        emailVerified: email_verified,
        profilePicture: picture,
        merryCoins: 50, // Starting coins
        totalXp: 0,
        level: 1,
      });

      // Initialize achievements for new user
      await initializeUserAchievementsForUser(user._id);

      // Create transaction for initial coins
      await Transaction.create({
        ownerUsername: user.username,
        ownerEmail: user.email,
        type: "purchase",
        coins: 50,
        coinsPurchased: 50,
        status: "completed",
        completedAt: new Date(),
        description: "Welcome bonus - Initial coins",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Fetch user with populated achievements
    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("achievements.achievementId");

    // Fetch user's messages and transactions
    const messages = await Message.find({
      ownerUsername: populatedUser.username,
    }).sort({
      createdAt: -1,
    });
    const transactions = await Transaction.find({
      ownerUsername: populatedUser.username,
    }).sort({
      createdAt: -1,
    });

    // Construct response
    const response = {
      ...populatedUser.toObject(),
      messages,
      transactions,
      token,
    };

    res.json(ApiResponse.success(response, "Google authentication successful"));
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(401).json(ApiResponse.error("Invalid Google token"));
  }
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

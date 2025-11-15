const Message = require("../models/Message");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const ApiResponse = require("../utils/ApiResponse");
const {
  generateMessageUrl,
  getFullViewUrl,
  generateShareableText,
} = require("../utils/linkGeneration");
const {
  awardXpToUserByUsername,
  getXpForAction,
} = require("../services/xpService");
const {
  checkAchievementsByCategory,
} = require("../services/achievementService");

/**
 * Calculate coins required based on media types
 */
const calculateMediaCost = (mediaTypes) => {
  if (!mediaTypes || mediaTypes.length === 0) {
    return 2; // Normal text cost
  }

  const costPerType = {
    video: 7,
    picture: 4,
    image: 4, // alias for picture
    audio: 5,
    text: 2,
    normaltext: 2,
  };

  let totalCost = 0;
  mediaTypes.forEach((type) => {
    const mediaType = type.toLowerCase();
    totalCost += costPerType[mediaType] || 2; // Default to 2 if type not found
  });

  return totalCost;
};

/**
 * Create a new message
 */
exports.createMessage = async (req, res) => {
  const {
    ownerEmail,
    ownerUsername,
    templateType,
    personalizedText,
    countdownDate,
    mediaUrls,
    mediaType,
  } = req.body;

  // Find the user
  const user = await User.findOne({ username: ownerUsername }).populate(
    "achievements.achievementId"
  );

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  // Calculate coins required based on media types
  const coinsRequired = calculateMediaCost(mediaType);
  if (user.merryCoins < coinsRequired) {
    return res.status(400).json(ApiResponse.error("Insufficient coins"));
  }

  // Generate unique message URL
  const messageUrl = generateMessageUrl();

  // Create message data
  const messageData = {
    ownerEmail,
    ownerUsername,
    templateType,
    personalizedText,
    mediaUrls: mediaUrls || [],
    mediaType: mediaType || [],
    coinsSpent: coinsRequired,
    messageUrl,
    timesOpened: 0,
  };

  // Add countdownDate if provided
  if (countdownDate) {
    messageData.countdownDate = countdownDate;
  }

  // Create message
  const message = await Message.create(messageData);

  // Deduct coins from user
  user.merryCoins -= coinsRequired;

  // Update user stats
  user.stats.totalMessagesSent += 1;
  user.stats.totalCoinsSpent += coinsRequired;

  await user.save();

  // Create spending transaction
  await Transaction.create({
    ownerUsername: user.username,
    ownerEmail: user.email,
    type: "spending",
    coins: coinsRequired,
    status: "completed",
    completedAt: new Date(),
    messageId: message._id,
    description: `Message created: ${message.templateType}`,
  });

  // Award XP for sending a message
  try {
    await awardXpToUserByUsername(
      user.username,
      getXpForAction("MESSAGE_SENT")
    );
  } catch (err) {
    console.error("Failed to award XP for message sent:", err.message);
  }

  // Check and unlock messaging achievements
  try {
    await checkAchievementsByCategory(user.username, "messaging");
  } catch (err) {
    console.error("Failed to check achievements:", err.message);
  }

  // Fetch updated user with populated achievements
  const updatedUser = await User.findById(user._id).populate(
    "achievements.achievementId"
  );

  // Prepare response
  const response = {
    message,
    uniqueUrl: message.messageUrl,
    shareableUrl: getFullViewUrl(message.messageUrl),
    shareableText: generateShareableText(user, message.messageUrl),
    remainingCoins: updatedUser.merryCoins,
    user: {
      username: updatedUser.username,
      name: updatedUser.name,
      level: updatedUser.level,
      totalXp: updatedUser.totalXp,
      merryCoins: updatedUser.merryCoins,
      stats: updatedUser.stats,
      achievements: updatedUser.achievements,
    },
  };

  res
    .status(201)
    .json(ApiResponse.success(response, "Message created successfully"));
};

/**
 * View a message by URL
 */
exports.viewMessage = async (req, res) => {
  const { messageUrl } = req.params;

  // Increment times opened and fetch message in one operation
  // Using findOneAndUpdate to avoid validation issues with old data
  const message = await Message.findOneAndUpdate(
    { messageUrl },
    { $inc: { timesOpened: 1 } },
    { new: true, runValidators: false }
  );

  if (!message) {
    return res.status(404).json(ApiResponse.error("Message not found"));
  }

  // Update stats
  const user = await User.findOne({ username: message.ownerUsername });
  if (user) {
    user.stats.totalMessagesViewed += 1;
    await user.save();

    // Award XP for message viewed
    try {
      await awardXpToUserByUsername(
        user.username,
        getXpForAction("MESSAGE_VIEWED")
      );
    } catch (err) {
      console.error("Failed to award XP for message view:", err.message);
    }
  }

  // Prepare response
  const response = {
    message,
    messageUrl: message.messageUrl,
    status: "active",
    shareOptions: ["copy_link", "whatsapp", "email", "social_media"],
    shareableUrl: getFullViewUrl(messageUrl),
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${getFullViewUrl(
      messageUrl
    )}`,
  };

  res.json(ApiResponse.success(response));
};

/**
 * Edit a message
 */
exports.editMessage = async (req, res) => {
  const { messageUrl } = req.params;
  const {
    templateType,
    personalizedText,
    countdownDate,
    mediaUrls,
    mediaType,
  } = req.body;

  const message = await Message.findOne({ messageUrl });

  if (!message) {
    return res.status(404).json(ApiResponse.error("Message not found"));
  }

  // Update fields
  if (templateType) message.templateType = templateType;
  if (personalizedText) message.personalizedText = personalizedText;
  if (countdownDate !== undefined) message.countdownDate = countdownDate;
  if (mediaUrls) message.mediaUrls = mediaUrls;
  if (mediaType) message.mediaType = mediaType;

  await message.save();

  // Prepare response
  const response = {
    message,
    messageUrl: message.messageUrl,
    shareableUrl: getFullViewUrl(message.messageUrl),
    status: "updated",
  };

  res.json(ApiResponse.success(response, "Message updated successfully"));
};

/**
 * Get all messages for a user
 */
exports.getUserMessages = async (req, res) => {
  const { username } = req.params;

  const messages = await Message.find({ ownerUsername: username }).sort({
    createdAt: -1,
  });

  res.json(ApiResponse.success(messages));
};

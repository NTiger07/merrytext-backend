const User = require("../models/User");
const UserStats = require("../models/UserStats");
const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");
const ApiResponse = require("../utils/ApiResponse");
const {
  xpToNextLevel,
  progressToNextLevel,
} = require("../utils/levelCalculation");

/**
 * Get user stats
 */
exports.getUserStats = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  // Get or create stats
  let stats = await UserStats.findOne({ userId: user._id });

  if (!stats) {
    stats = await UserStats.create({
      userId: user._id,
      totalMessagesSent: 0,
      totalMessagesViewed: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      uniqueRecipients: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
  }

  // Build response
  const response = {
    userId: user._id,
    name: user.name,
    merryCoins: user.merryCoins,
    totalXp: user.totalXp,
    level: user.level,
    xpToNextLevel: xpToNextLevel(user.totalXp),
    progressToNextLevel: progressToNextLevel(user.totalXp),
    totalMessagesSent: stats.totalMessagesSent,
    totalMessagesViewed: stats.totalMessagesViewed,
    totalCoinsEarned: stats.totalCoinsEarned,
    totalCoinsSpent: stats.totalCoinsSpent,
    uniqueRecipients: stats.uniqueRecipients,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
  };

  res.json(ApiResponse.success(response));
};

/**
 * Get user achievements
 */
exports.getUserAchievements = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  // Get user achievements with achievement details
  const userAchievements = await UserAchievement.find({
    userId: user._id,
  }).populate("achievementId");

  // Map to response format
  const achievements = userAchievements.map((ua) => {
    const achievement = ua.achievementId;
    return {
      id: achievement._id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      unlocked: ua.unlocked,
      progress: ua.progress,
      total: achievement.total,
      category: achievement.category,
      xpReward: achievement.xpReward,
      unlockedAt: ua.unlockedAt,
    };
  });

  res.json(ApiResponse.success(achievements));
};

/**
 * Get leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  const { sortBy = "xp", limit = 10 } = req.query;

  let sortField = "totalXp";
  if (sortBy === "coins") {
    sortField = "merryCoins";
  } else if (sortBy === "level") {
    sortField = "level";
  }

  const users = await User.find()
    .select("username name level totalXp merryCoins profilePicture")
    .sort({ [sortField]: -1 })
    .limit(parseInt(limit));

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    name: user.name,
    level: user.level,
    totalXp: user.totalXp,
    merryCoins: user.merryCoins,
    profilePicture: user.profilePicture,
  }));

  res.json(ApiResponse.success(leaderboard));
};

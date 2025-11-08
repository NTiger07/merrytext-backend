const User = require("../models/User");
const Achievement = require("../models/Achievement");
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

  // Build response from embedded stats
  const response = {
    userId: user._id,
    name: user.name,
    merryCoins: user.merryCoins,
    totalXp: user.totalXp,
    level: user.level,
    xpToNextLevel: xpToNextLevel(user.totalXp),
    progressToNextLevel: progressToNextLevel(user.totalXp),
    totalMessagesSent: user.stats.totalMessagesSent,
    totalMessagesViewed: user.stats.totalMessagesViewed,
    totalCoinsEarned: user.stats.totalCoinsEarned,
    totalCoinsSpent: user.stats.totalCoinsSpent,
    uniqueRecipients: user.stats.uniqueRecipients,
    currentStreak: user.stats.currentStreak,
    longestStreak: user.stats.longestStreak,
  };

  res.json(ApiResponse.success(response));
};

/**
 * Get user achievements
 */
exports.getUserAchievements = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).populate(
    "achievements.achievementId"
  );

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  // Map embedded achievements to response format
  const achievements = user.achievements.map((ua) => {
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

const User = require("../models/User");
const { calculateLevel } = require("../utils/levelCalculation");

/**
 * XP mapping for actions
 */
const XP_FOR_ACTION = {
  MESSAGE_SENT: 10,
  MESSAGE_VIEWED: 5,
  PURCHASE_COINS: 15,
  DAILY_LOGIN: 20,
  ACHIEVEMENT_UNLOCKED_BASE: 50, // base amount, achievement specific xpReward should be added by caller
};

/**
 * Get XP amount for a named action
 */
function getXpForAction(action) {
  return XP_FOR_ACTION[action] || 0;
}

/**
 * Award XP to a user by username. Updates totalXp and level, awards coins per level gained.
 * Returns the updated user document.
 */
async function awardXpToUserByUsername(username, xpAmount) {
  if (!username) throw new Error("username is required");
  if (!xpAmount || xpAmount <= 0) return null;

  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");

  const oldTotal = user.totalXp || 0;
  const oldLevel = user.level || calculateLevel(oldTotal);

  const newTotal = oldTotal + xpAmount;
  const newLevel = calculateLevel(newTotal);

  user.totalXp = newTotal;
  user.level = newLevel;

  await user.save();

  return user;
}

/**
 * Recalculate a user's totalXp from stats, completed purchases and unlocked achievements.
 * This is intended for one-off recalculation/migration and will set `totalXp` and `level`.
 */
async function recalculateUserXp(username) {
  if (!username) throw new Error("username is required");

  const Transaction = require("../models/Transaction");
  const User = require("../models/User");

  const user = await User.findOne({ username }).populate(
    "achievements.achievementId"
  );
  if (!user) throw new Error("User not found");

  // XP from stats
  const xpFromMessagesSent =
    (user.stats.totalMessagesSent || 0) * XP_FOR_ACTION.MESSAGE_SENT;
  const xpFromMessagesViewed =
    (user.stats.totalMessagesViewed || 0) * XP_FOR_ACTION.MESSAGE_VIEWED;

  // XP from completed purchases (count transactions)
  const completedTxCount = await Transaction.countDocuments({
    ownerUsername: username,
    status: "completed",
  });
  const xpFromPurchases = completedTxCount * XP_FOR_ACTION.PURCHASE_COINS;

  // XP from unlocked achievements: base + achievement.xpReward
  let xpFromAchievements = 0;
  for (const ua of user.achievements || []) {
    if (ua.unlocked && ua.achievementId) {
      const reward = ua.achievementId.xpReward || 0;
      xpFromAchievements += XP_FOR_ACTION.ACHIEVEMENT_UNLOCKED_BASE + reward;
    }
  }

  const totalXp =
    xpFromMessagesSent +
    xpFromMessagesViewed +
    xpFromPurchases +
    xpFromAchievements;

  user.totalXp = totalXp;
  user.level = calculateLevel(totalXp);

  await user.save();

  return user;
}

module.exports = {
  getXpForAction,
  awardXpToUserByUsername,
  recalculateUserXp,
  XP_FOR_ACTION,
};

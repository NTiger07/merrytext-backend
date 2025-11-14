const User = require("../models/User");
const Achievement = require("../models/Achievement");
const { awardXpToUserByUsername, XP_FOR_ACTION } = require("./xpService");

/**
 * Check and update achievements for a user based on their current stats.
 * Unlocks achievements when conditions are met and awards XP.
 * Returns array of newly unlocked achievements.
 */
async function checkAndUpdateAchievements(username) {
  if (!username) throw new Error("username is required");

  const user = await User.findOne({ username }).populate(
    "achievements.achievementId"
  );
  if (!user) throw new Error("User not found");

  const newlyUnlocked = [];
  let progressUpdated = false;

  for (const userAchievement of user.achievements) {
    const achievement = userAchievement.achievementId;
    if (!achievement) continue;

    let currentProgress = 0;
    let shouldUnlock = false;

    // Check achievement category and calculate progress
    switch (achievement.category) {
      case "messaging":
        if (achievement.name === "First Message") {
          // First Message: Send your first festive message
          currentProgress = user.stats.totalMessagesSent || 0;
          shouldUnlock = currentProgress >= achievement.total;
        } else if (achievement.name === "Master Messenger") {
          // Master Messenger: Send 100 total messages
          currentProgress = user.stats.totalMessagesSent || 0;
          shouldUnlock = currentProgress >= achievement.total;
        }
        break;

      case "social":
        if (achievement.name === "Social Butterfly") {
          // Social Butterfly: Send messages to 10 different people
          currentProgress = user.stats.uniqueRecipients || 0;
          shouldUnlock = currentProgress >= achievement.total;
        }
        break;

      case "coins":
        if (achievement.name === "Coin Collector") {
          // Coin Collector: Earn 100 coins
          currentProgress = user.stats.totalCoinsEarned || 0;
          shouldUnlock = currentProgress >= achievement.total;
        }
        break;

      case "speed":
        if (achievement.name === "Speed Sender") {
          // Speed Sender: Send 5 messages in one day
          // Check if messagesViewedToday is being used for daily messages
          // (Note: Implementation may need adjustment based on actual daily tracking)
          currentProgress = user.stats.messagesViewedToday || 0;
          shouldUnlock = currentProgress >= achievement.total;
        }
        break;

      default:
        // Unknown category, skip
        continue;
    }

    // Update progress for all achievements (locked and unlocked)
    const newProgress = Math.min(currentProgress, achievement.total);
    if (userAchievement.progress !== newProgress) {
      userAchievement.progress = newProgress;
      progressUpdated = true;
    }

    // Unlock if conditions met and not already unlocked
    if (shouldUnlock && !userAchievement.unlocked) {
      userAchievement.unlocked = true;
      userAchievement.unlockedAt = new Date();

      newlyUnlocked.push({
        id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        category: achievement.category,
      });

      // Award XP for achievement (base + achievement-specific reward)
      const totalXpReward =
        XP_FOR_ACTION.ACHIEVEMENT_UNLOCKED_BASE + (achievement.xpReward || 0);

      try {
        await awardXpToUserByUsername(username, totalXpReward);
        console.log(
          `🏆 Achievement unlocked for ${username}: ${achievement.name} (+${totalXpReward} XP)`
        );
      } catch (err) {
        console.error(
          `Failed to award XP for achievement ${achievement.name}:`,
          err.message
        );
      }
    }
  }

  // Save if any achievements were unlocked or progress was updated
  if (newlyUnlocked.length > 0 || progressUpdated) {
    await user.save();
  }

  return newlyUnlocked;
}

/**
 * Check achievements for a specific action/category only.
 * More efficient than checking all achievements.
 */
async function checkAchievementsByCategory(username, category) {
  if (!username) throw new Error("username is required");

  const user = await User.findOne({ username }).populate(
    "achievements.achievementId"
  );
  if (!user) throw new Error("User not found");

  const relevantAchievements = user.achievements.filter(
    (ua) => ua.achievementId && ua.achievementId.category === category
  );

  if (relevantAchievements.length === 0) {
    return [];
  }

  // Run full check (it will process all achievements in the category)
  return await checkAndUpdateAchievements(username);
}

module.exports = {
  checkAndUpdateAchievements,
  checkAchievementsByCategory,
};

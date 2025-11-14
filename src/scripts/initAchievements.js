const Achievement = require("../models/Achievement");
const User = require("../models/User");

/**
 * Initialize achievements in the database
 * This runs on server startup and populates default achievements
 */
const initializeAchievements = async () => {
  try {
    const achievements = [
      {
        name: "First Message",
        description: "Send your first festive message",
        icon: "✨",
        total: 1,
        category: "messaging",
        xpReward: 50,
      },
      {
        name: "Social Butterfly",
        description: "Send messages to 10 different people",
        icon: "🎯",
        total: 10,
        category: "social",
        xpReward: 100,
      },
      {
        name: "Coin Collector",
        description: "Earn 100 coins",
        icon: "🏆",
        total: 100,
        category: "coins",
        xpReward: 75,
      },
      {
        name: "Speed Sender",
        description: "Send 5 messages in one day",
        icon: "⚡",
        total: 5,
        category: "speed",
        xpReward: 60,
      },
      {
        name: "Master Messenger",
        description: "Send 100 total messages",
        icon: "🏅",
        total: 100,
        category: "messaging",
        xpReward: 200,
      },
    ];

    // Insert achievements only if they don't exist
    for (const achievementData of achievements) {
      const existing = await Achievement.findOne({
        name: achievementData.name,
      });

      if (!existing) {
        await Achievement.create(achievementData);
        console.log(`✅ Created achievement: ${achievementData.name}`);
      }
    }

    const achievementCount = await Achievement.countDocuments();
    console.log(`📊 Total achievements in database: ${achievementCount}`);
  } catch (error) {
    console.error("❌ Error initializing achievements:", error.message);
  }
};

/**
 * Initialize user achievements for all users
 * Adds achievement entries to user.achievements array for any missing achievements
 */
const initializeUserAchievements = async () => {
  try {
    // Get all users and achievements
    const users = await User.find();
    const achievements = await Achievement.find();

    if (achievements.length === 0) {
      console.log(
        "⚠️  No achievements found. Run initializeAchievements first."
      );
      return;
    }

    let usersUpdated = 0;
    let achievementsAdded = 0;

    const { recalculateUserXp } = require("../services/xpService");

    // For each user, add missing achievements to their achievements array
    for (const user of users) {
      let userModified = false;

      for (const achievement of achievements) {
        // Check if user already has this achievement
        const hasAchievement = user.achievements.some(
          (ua) => ua.achievementId.toString() === achievement._id.toString()
        );

        if (!hasAchievement) {
          user.achievements.push({
            achievementId: achievement._id,
            progress: 0,
            unlocked: false,
          });
          achievementsAdded++;
          userModified = true;
        }
      }

      if (userModified) {
        await user.save();
        // Recalculate XP for user after adding achievements (safe to run repeatedly)
        try {
          await recalculateUserXp(user.username);
        } catch (err) {
          console.error(
            `Failed to recalculate XP for user ${user.username}:`,
            err.message
          );
        }
        usersUpdated++;
      }
    }

    console.log(
      `✅ UserAchievements initialized: ${achievementsAdded} achievements added to ${usersUpdated} users`
    );
  } catch (error) {
    console.error("❌ Error initializing user achievements:", error.message);
  }
};

/**
 * Initialize achievements for a specific new user
 * Called when a new user registers
 */
const initializeUserAchievementsForUser = async (userId) => {
  try {
    const achievements = await Achievement.find();
    const user = await User.findById(userId);

    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return;
    }

    let achievementsAdded = 0;

    for (const achievement of achievements) {
      // Check if user already has this achievement
      const hasAchievement = user.achievements.some(
        (ua) => ua.achievementId.toString() === achievement._id.toString()
      );

      if (!hasAchievement) {
        user.achievements.push({
          achievementId: achievement._id,
          progress: 0,
          unlocked: false,
        });
        achievementsAdded++;
      }
    }

    if (achievementsAdded > 0) {
      await user.save();
      console.log(
        `✅ Initialized ${achievementsAdded} achievements for user: ${userId}`
      );
    }
  } catch (error) {
    console.error(
      `❌ Error initializing achievements for user ${userId}:`,
      error.message
    );
  }
};

module.exports = {
  initializeAchievements,
  initializeUserAchievements,
  initializeUserAchievementsForUser,
};

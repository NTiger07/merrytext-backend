require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Achievement = require("../models/Achievement");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/merrytext";
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out to preserve data)
    // await User.deleteMany({});
    // await Achievement.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Seed sample users
    const users = [
      {
        email: "john@example.com",
        username: "johndoe",
        name: "John Doe",
        password: "password123",
        merryCoins: 100,
        totalXp: 250,
        level: 2,
        emailVerified: true,
        stats: {
          totalMessagesSent: 5,
          totalMessagesViewed: 10,
          totalCoinsEarned: 100,
          totalCoinsSpent: 5,
          uniqueRecipients: 3,
          currentStreak: 2,
          longestStreak: 5,
        },
      },
      {
        email: "jane@example.com",
        username: "janedoe",
        name: "Jane Doe",
        password: "password123",
        merryCoins: 50,
        totalXp: 50,
        level: 1,
        emailVerified: true,
        stats: {
          totalMessagesSent: 1,
          totalMessagesViewed: 2,
          totalCoinsEarned: 50,
          totalCoinsSpent: 1,
          uniqueRecipients: 1,
          currentStreak: 1,
          longestStreak: 1,
        },
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        console.log(`✅ Created user: ${user.username}`);
      } else {
        console.log(`⏭️  User ${userData.username} already exists`);
      }
    }

    // Seed achievements
    const achievements = [
      {
        name: "First Message",
        description: "Send your first message",
        icon: "📨",
        total: 1,
        category: "messaging",
        xpReward: 50,
      },
      {
        name: "Social Butterfly",
        description: "Send messages to 10 different people",
        icon: "🦋",
        total: 10,
        category: "social",
        xpReward: 100,
      },
      {
        name: "Coin Collector",
        description: "Earn 100 MerryCoins",
        icon: "💰",
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
        xpReward: 80,
      },
    ];

    for (const achievementData of achievements) {
      const existing = await Achievement.findOne({
        name: achievementData.name,
      });
      if (!existing) {
        await Achievement.create(achievementData);
        console.log(`✅ Created achievement: ${achievementData.name}`);
      } else {
        console.log(`⏭️  Achievement ${achievementData.name} already exists`);
      }
    }

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();

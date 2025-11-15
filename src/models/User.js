const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Subdocument schema for user stats
const userStatsSchema = new mongoose.Schema(
  {
    totalMessagesSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMessagesViewed: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCoinsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCoinsSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueRecipients: {
      type: Number,
      default: 0,
      min: 0,
    },
    recipientsList: [
      {
        type: String,
        trim: true,
      },
    ],
    messagesViewedToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageDate: {
      type: Date,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

// Subdocument schema for user achievements
const userAchievementSchema = new mongoose.Schema(
  {
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    unlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    authProvider: {
      type: String,
      enum: ["google", "apple", "email"],
      default: "email",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    profilePicture: {
      type: String,
    },
    merryCoins: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Embedded user stats
    stats: {
      type: userStatsSchema,
      default: () => ({}),
    },
    // Embedded user achievements
    achievements: {
      type: [userAchievementSchema],
      default: [],
    },
    // Virtual references to related data
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate XP to next level
userSchema.methods.getXpToNextLevel = function () {
  const baseXp = 100;
  const levelMultiplier = 1.5;
  return Math.floor(baseXp * Math.pow(levelMultiplier, this.level));
};

// Method to calculate progress to next level
userSchema.methods.getProgressToNextLevel = function () {
  const currentLevelXp =
    this.level === 1 ? 0 : Math.floor(100 * Math.pow(1.5, this.level - 1));
  const nextLevelXp = this.getXpToNextLevel();
  const xpInCurrentLevel = this.totalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  return (xpInCurrentLevel / xpNeededForLevel) * 100;
};

module.exports = mongoose.model("User", userSchema);

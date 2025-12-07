const mongoose = require("mongoose");

const puzzleScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    puzzleType: {
      type: String,
      required: true,
      enum: ["santa", "snowman", "tree"],
      index: true,
    },
    timeMs: {
      type: Number,
      required: true,
      min: 1,
      max: 3600000, // 1 hour max
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for leaderboard queries
puzzleScoreSchema.index({ puzzleType: 1, timeMs: 1, createdAt: 1 });

// Index for user's scores
puzzleScoreSchema.index({ userId: 1, createdAt: -1 });

const PuzzleScore = mongoose.model("PuzzleScore", puzzleScoreSchema);

module.exports = PuzzleScore;

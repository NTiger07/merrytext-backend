const mongoose = require("mongoose");

const ticTacToeScoreSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
      index: true,
    },
    result: {
      type: String,
      required: true,
      enum: ["win", "loss", "draw"],
      index: true,
    },
    moves: {
      type: Number,
      required: true,
      min: 5,
      max: 9,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for leaderboard queries
ticTacToeScoreSchema.index({
  difficulty: 1,
  result: 1,
  moves: 1,
  createdAt: 1,
});

// Index for user's scores
ticTacToeScoreSchema.index({ username: 1, createdAt: -1 });

const TicTacToeScore = mongoose.model("TicTacToeScore", ticTacToeScoreSchema);

module.exports = TicTacToeScore;

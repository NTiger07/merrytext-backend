const TicTacToeScore = require("../models/TicTacToeScore");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Points system for Tic-Tac-Toe
 */
const POINTS = {
  win: 50,
  draw: 10,
  loss: 0,
};

/**
 * Submit a tic-tac-toe game result
 * POST /api/tictactoe/score
 */
exports.submitScore = async (req, res) => {
  try {
    const { difficulty, result, moves, username } = req.body;

    // Create new game entry
    const score = new TicTacToeScore({
      username,
      difficulty,
      result,
      moves,
    });

    await score.save();

    // Calculate points
    const points = POINTS[result];

    return res.status(200).json(
      ApiResponse.success({
        id: score._id,
        message: "Game saved successfully!",
        points,
      })
    );
  } catch (error) {
    console.error("Error submitting tic-tac-toe game:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to submit game", null, 500));
  }
};

/**
 * Get tic-tac-toe play history
 * GET /api/tictactoe/history
 */
exports.getHistory = async (req, res) => {
  try {
    const { username } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    // Validate username is provided
    if (!username) {
      return res
        .status(400)
        .json(ApiResponse.error("Username is required", null, 400));
    }

    // Validate limit
    if (limit < 1 || limit > 500) {
      return res
        .status(400)
        .json(ApiResponse.error("Limit must be between 1 and 500", null, 400));
    }

    // Get play history for the user, sorted by most recent first
    const history = await TicTacToeScore.find({ username })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("difficulty result moves createdAt")
      .lean();

    // Calculate statistics
    const stats = {
      totalGames: history.length,
      wins: history.filter((g) => g.result === "win").length,
      draws: history.filter((g) => g.result === "draw").length,
      losses: history.filter((g) => g.result === "loss").length,
    };

    // Format response
    const formattedData = history.map((entry) => ({
      id: entry._id,
      difficulty: entry.difficulty,
      result: entry.result,
      moves: entry.moves,
      created_at: entry.createdAt,
    }));

    return res.status(200).json(
      ApiResponse.success({
        stats,
        history: formattedData,
      })
    );
  } catch (error) {
    console.error("Error fetching tic-tac-toe history:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to fetch history", null, 500));
  }
};

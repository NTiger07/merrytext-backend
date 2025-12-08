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
 * Submit a tic-tac-toe score
 * POST /api/tictactoe/score
 */
exports.submitScore = async (req, res) => {
  try {
    const { difficulty, result, moves, username } = req.body;

    // Create new score entry
    const score = new TicTacToeScore({
      username,
      difficulty,
      result,
      moves,
    });

    await score.save();

    // Calculate points
    const points = POINTS[result];

    // Calculate rank (count how many scores are better)
    // Better = wins first, then draws, then losses; within category, fewer moves is better
    const resultOrder = { win: 1, draw: 2, loss: 3 };

    const rank = await TicTacToeScore.countDocuments({
      difficulty,
      $or: [
        // Better result
        {
          result: {
            $in: Object.keys(resultOrder).filter(
              (r) => resultOrder[r] < resultOrder[result]
            ),
          },
        },
        // Same result but fewer moves
        {
          result,
          moves: { $lt: moves },
        },
      ],
    });

    return res.status(200).json(
      ApiResponse.success({
        id: score._id,
        message: "Score saved successfully!",
        points,
        rank: rank + 1,
      })
    );
  } catch (error) {
    console.error("Error submitting tic-tac-toe score:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to submit score", null, 500));
  }
};

/**
 * Get tic-tac-toe leaderboard
 * GET /api/tictactoe/leaderboard/:difficulty
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    // Validate difficulty
    const validDifficulties = ["easy", "medium", "hard", "all"];
    if (!validDifficulties.includes(difficulty)) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            "Invalid difficulty level. Must be one of: easy, medium, hard, all",
            null,
            400
          )
        );
    }

    // Validate limit
    if (limit < 1 || limit > 500) {
      return res
        .status(400)
        .json(ApiResponse.error("Limit must be between 1 and 500", null, 400));
    }

    // Build query
    const query = difficulty === "all" ? {} : { difficulty };

    // Get leaderboard with custom sorting
    // Sort by: result (win > draw > loss), then moves (ascending), then createdAt (ascending)
    const leaderboard = await TicTacToeScore.aggregate([
      { $match: query },
      {
        $addFields: {
          resultOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$result", "win"] }, then: 1 },
                { case: { $eq: ["$result", "draw"] }, then: 2 },
                { case: { $eq: ["$result", "loss"] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { resultOrder: 1, moves: 1, createdAt: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          username: 1,
          difficulty: 1,
          result: 1,
          moves: 1,
          createdAt: 1,
        },
      },
    ]);

    // Format response to match API spec
    const formattedData = leaderboard.map((entry) => ({
      id: entry._id,
      username: entry.username,
      difficulty: entry.difficulty,
      result: entry.result,
      moves: entry.moves,
      created_at: entry.createdAt,
    }));

    return res.status(200).json(ApiResponse.success(formattedData));
  } catch (error) {
    console.error("Error fetching tic-tac-toe leaderboard:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to fetch leaderboard", [], 500));
  }
};

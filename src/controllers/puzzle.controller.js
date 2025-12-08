const PuzzleScore = require("../models/PuzzleScore");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Submit a puzzle score
 * POST /api/puzzle/score
 */
exports.submitScore = async (req, res) => {
  try {
    const { puzzleType, timeMs, username } = req.body;

    // Create new score entry
    const score = new PuzzleScore({
      username,
      puzzleType,
      timeMs,
    });

    await score.save();

    // Calculate rank (count how many scores are better)
    const rank = await PuzzleScore.countDocuments({
      puzzleType,
      timeMs: { $lt: timeMs },
    });

    return res.status(200).json(
      ApiResponse.success({
        id: score._id,
        message: "Score submitted successfully!",
        rank: rank + 1,
        timeMs,
      })
    );
  } catch (error) {
    console.error("Error submitting puzzle score:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to submit score", null, 500));
  }
};

/**
 * Get puzzle leaderboard
 * GET /api/puzzle/leaderboard/:puzzleType
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { puzzleType } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    // Validate puzzle type
    const validTypes = ["santa", "snowman", "tree", "all"];
    if (!validTypes.includes(puzzleType)) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            "Invalid puzzle type. Must be one of: santa, snowman, tree, all",
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
    const query = puzzleType === "all" ? {} : { puzzleType };

    // Get leaderboard sorted by time (ascending) and creation date
    const leaderboard = await PuzzleScore.find(query)
      .sort({ timeMs: 1, createdAt: 1 })
      .limit(limit)
      .select("username puzzleType timeMs createdAt")
      .lean();

    // Format response to match API spec
    const formattedData = leaderboard.map((entry) => ({
      id: entry._id,
      username: entry.username,
      puzzle_type: entry.puzzleType,
      time_ms: entry.timeMs,
      created_at: entry.createdAt,
    }));

    return res.status(200).json(ApiResponse.success(formattedData));
  } catch (error) {
    console.error("Error fetching puzzle leaderboard:", error);
    return res
      .status(500)
      .json(ApiResponse.error("Failed to fetch leaderboard", [], 500));
  }
};

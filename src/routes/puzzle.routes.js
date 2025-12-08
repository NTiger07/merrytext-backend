const express = require("express");
const router = express.Router();
const puzzleController = require("../controllers/puzzle.controller");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

// Public route - Get leaderboard
router.get("/leaderboard/:puzzleType", puzzleController.getLeaderboard);

// Public route - Submit score
router.post(
  "/score",
  validate(schemas.submitPuzzleScore),
  puzzleController.submitScore
);

module.exports = router;

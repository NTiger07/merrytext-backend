const express = require("express");
const router = express.Router();
const puzzleController = require("../controllers/puzzle.controller");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

// Public route - Get leaderboard
router.get("/leaderboard/:puzzleType", puzzleController.getLeaderboard);

// Protected route - Submit score
router.post(
  "/score",
  authenticate,
  validate(schemas.submitPuzzleScore),
  puzzleController.submitScore
);

module.exports = router;

const express = require("express");
const router = express.Router();
const tictactoeController = require("../controllers/tictactoe.controller");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

// Public route - Get leaderboard
router.get("/leaderboard/:difficulty", tictactoeController.getLeaderboard);

// Public route - Submit score
router.post(
  "/score",
  validate(schemas.submitTicTacToeScore),
  tictactoeController.submitScore
);

module.exports = router;

const express = require("express");
const router = express.Router();
const tictactoeController = require("../controllers/tictactoe.controller");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

// Public route - Get leaderboard
router.get("/leaderboard/:difficulty", tictactoeController.getLeaderboard);

// Protected route - Submit score
router.post(
  "/score",
  authenticate,
  validate(schemas.submitTicTacToeScore),
  tictactoeController.submitScore
);

module.exports = router;

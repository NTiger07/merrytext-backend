const express = require("express");
const router = express.Router();
const tictactoeController = require("../controllers/tictactoe.controller");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

// Public route - Get play history for a user
router.get("/history", tictactoeController.getHistory);

// Public route - Submit game result
router.post(
  "/score",
  validate(schemas.submitTicTacToeScore),
  tictactoeController.submitScore
);

module.exports = router;

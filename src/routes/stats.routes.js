const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");

// All stats routes are public (can add auth if needed)
router.get("/user/:username", statsController.getUserStats);
router.get("/achievements/:username", statsController.getUserAchievements);
router.get("/leaderboard", statsController.getLeaderboard);

module.exports = router;

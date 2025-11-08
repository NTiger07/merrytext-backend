const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/authenticate");

// Public routes
router.get("/all", userController.getAllUsers);
router.get("/:username", userController.getUserByUsername);
router.post("/register", userController.registerUser);

// Protected routes
router.put("/:username", authenticate, userController.updateUser);

module.exports = router;

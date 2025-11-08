const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authenticate = require("../middleware/authenticate");

// Public routes
router.get("/view/:messageUrl", messageController.viewMessage);

// Protected routes (optional - can be made public if needed)
router.post("/create", messageController.createMessage);
router.put("/edit/:messageUrl", messageController.editMessage);
router.get("/user/:username", messageController.getUserMessages);

module.exports = router;

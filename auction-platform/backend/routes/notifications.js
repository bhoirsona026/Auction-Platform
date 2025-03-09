const express = require("express");
const Notification = require("../models/Notification");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// Get all notifications for a user
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notifications as read
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

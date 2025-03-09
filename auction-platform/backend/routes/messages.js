const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// ✅ Send a new message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const message = new Message({ senderId, receiverId, text });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
});

// ✅ Get chat history between two users
router.get("/:user1Id/:user2Id", async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    }).sort("timestamp");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

module.exports = router;

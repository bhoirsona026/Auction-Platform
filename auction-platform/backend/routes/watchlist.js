const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const Watchlist = require("../models/Watchlist");

const router = express.Router();

// ✅ Add an auction to watchlist
router.post("/add", authenticate, async (req, res) => {
  try {
    const { auctionId } = req.body;
    const userId = req.user._id;

    // Check if already in watchlist
    const exists = await Watchlist.findOne({ userId, auctionId });
    if (exists) return res.status(400).json({ message: "Already in watchlist" });

    const watchlistItem = new Watchlist({ userId, auctionId });
    await watchlistItem.save();

    res.status(201).json({ message: "Added to watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Remove an auction from watchlist
router.delete("/remove/:auctionId", authenticate, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user._id;

    await Watchlist.findOneAndDelete({ userId, auctionId });
    res.json({ message: "Removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get user's watchlist
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const watchlist = await Watchlist.find({ userId }).populate("auctionId");
    
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

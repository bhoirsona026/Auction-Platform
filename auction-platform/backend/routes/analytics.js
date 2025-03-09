const express = require("express");
const adminAuth = require("../middlewares/adminMiddleware");
const Auction = require("../models/Auction");
const User = require("../models/User");

const router = express.Router();

// 📌 Get total number of users
router.get("/users/count", adminAuth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ totalUsers: userCount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Get total number of auctions
router.get("/auctions/count", adminAuth, async (req, res) => {
  try {
    const auctionCount = await Auction.countDocuments();
    res.json({ totalAuctions: auctionCount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Get top 5 most bid auctions
router.get("/auctions/top-bids", adminAuth, async (req, res) => {
  try {
    const topAuctions = await Auction.find()
      .sort({ "bids.length": -1 }) // Sort by number of bids
      .limit(5);
    res.json(topAuctions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: "active" });

    res.json({ totalAuctions, activeAuctions });
  } catch (error) {
    res.status(500).json({ error: "Error fetching analytics" });
  }
});

module.exports = router;

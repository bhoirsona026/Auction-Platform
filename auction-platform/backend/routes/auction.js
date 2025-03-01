const express = require("express");
const router = express.Router();
const Auction = require("../models/Auction");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Ensure correct middleware is imported

// ✅ Create a new auction (only authenticated users)
router.post("/create", authMiddleware, async (req, res) => {
  try {
      console.log("Request Body:", req.body);

      const { title, description, startingPrice, endTime } = req.body;

      if (!title || !description || !startingPrice || !endTime) {
          return res.status(400).json({ message: "All fields are required" });
      }

      const newAuction = new Auction({
          title,
          description,
          startingPrice,
          endTime,
          createdBy: req.user.userId, // ✅ Ensure JWT contains userId
      });

      await newAuction.save();
      res.status(201).json({ message: "Auction created successfully", auction: newAuction });

  } catch (error) {
      console.error("Auction creation error:", error);
      res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Get all auctions
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.find().populate("createdBy", "username email");
    res.status(200).json(auctions);
  } catch (err) {
    console.error("Error fetching auctions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get auction by ID
router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate("createdBy", "username email");
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    res.status(200).json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Place a bid on an auction (requires authentication)
router.post("/bid/:auctionId", authMiddleware, async (req, res) => {
  try {
      const { auctionId } = req.params;
      const { amount } = req.body;
      const userId = req.user.userId; // ✅ Get userId from JWT

      let auction = await Auction.findById(auctionId);
      if (!auction) return res.status(404).json({ message: "Auction not found" });

      if (amount <= auction.currentPrice) {
          return res.status(400).json({ message: "Bid must be higher than the current price" });
      }

      // ✅ Add bid to auction
      auction.bids.push({ user: userId, amount });
      auction.currentPrice = amount;
      await auction.save();

      res.json({ message: "Bid placed successfully!", auction });
  } catch (err) {
      console.error("Error placing bid:", err);
      res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

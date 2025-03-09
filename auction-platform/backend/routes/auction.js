const express = require("express");
const mongoose = require("mongoose");
const Auction = require("../models/Auction");
const Notification = require("../models/Notification");
const { authenticate, isSeller, isBuyer, isAdmin } = require("../middlewares/authMiddleware");
const { createAuction, deleteAuction, placeBid } = require("../controllers/auctionController");
const sendEmail = require("../utils/emailService");

module.exports = function (io) {
  const router = express.Router();

  /** 
   * ✅ Create an Auction (Only Sellers)
   */
  router.post("/", authenticate, isSeller, createAuction);

  /** 
   * ✅ Get All Auctions (with filters)
   */
  router.get("/", async (req, res) => {
    try {
      const { search, category, subcategory, minPrice, maxPrice, status } = req.query;
      let filters = {};

      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
      if (category) filters.category = category;
      if (subcategory) filters.subcategory = subcategory;
      if (minPrice) filters.currentPrice = { ...filters.currentPrice, $gte: minPrice };
      if (maxPrice) filters.currentPrice = { ...filters.currentPrice, $lte: maxPrice };
      if (status === "ongoing") filters.endTime = { $gte: new Date() };
      if (status === "completed") filters.endTime = { $lt: new Date() };

      const auctions = await Auction.find(filters).populate("createdBy", "username email");
      res.json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /** 
   * ✅ Get Single Auction by ID
   */
  router.get("/:auctionId", async (req, res) => {
    try {
      const { auctionId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(auctionId)) {
        return res.status(400).json({ message: "Invalid auction ID format" });
      }

      const auction = await Auction.findById(auctionId)
        .populate("createdBy", "username email")
        .populate("bids.user", "username email");

      if (!auction) return res.status(404).json({ message: "Auction not found" });

      res.status(200).json(auction);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /** 
   * ✅ Place a Bid (Only Buyers)
   */
  router.post("/:auctionId/bid", authenticate, isBuyer, placeBid);

  /** 
   * ✅ Get Bid History for an Auction
   */
  router.get("/:auctionId/bids", async (req, res) => {
    try {
      const auction = await Auction.findById(req.params.auctionId).populate("bids.user", "username email");
      if (!auction) return res.status(404).json({ message: "Auction not found" });

      res.json(auction.bids);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /** 
   * ✅ Get Bid History for a Specific User
   */
  router.get("/user/:userId/bids", async (req, res) => {
    try {
      const auctions = await Auction.find({ "bids.user": req.params.userId }).populate("bids.user", "username email");

      const userBids = auctions.map((auction) => ({
        auctionId: auction._id,
        title: auction.title,
        bids: auction.bids.filter((bid) => bid.user._id.toString() === req.params.userId),
      }));

      res.json(userBids);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /** 
   * ✅ Approve or Reject an Auction (Only Admins)
   */
  router.put("/:auctionId/approve", authenticate, isAdmin, async (req, res) => {
    try {
      const { auctionId } = req.params;
      const { status } = req.body; // "approved" or "rejected"

      if (!mongoose.Types.ObjectId.isValid(auctionId)) {
        return res.status(400).json({ message: "Invalid auction ID format" });
      }

      let auction = await Auction.findByIdAndUpdate(auctionId, { status }, { new: true }).populate("createdBy", "email username");
      if (!auction) return res.status(404).json({ message: "Auction not found" });

      // Send Email Notification
      const emailText = `Your auction '${auction.title}' has been ${status} by the admin.`;
      await sendEmail(auction.createdBy.email, `Auction ${status}`, emailText);

      res.json({ message: `Auction ${status} successfully!`, auction });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /** 
   * ✅ Delete an Auction (Only Sellers)
   */
  router.delete("/:id", authenticate, isSeller, deleteAuction);

  return router;
};

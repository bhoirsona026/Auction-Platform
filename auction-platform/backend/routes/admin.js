const express = require("express");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");
const { getAdminDashboard } = require("../controllers/adminController");

const User = require("../models/User");
const Auction = require("../models/Auction");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Debugging logs
console.log("✅ authenticate:", typeof authenticate);
console.log("✅ isAdmin:", typeof isAdmin);
console.log("✅ getAdminDashboard:", typeof getAdminDashboard);

// Admin Dashboard Route
router.get("/dashboard", authenticate, isAdmin, getAdminDashboard);

// ✅ Get all users (Admin only)
router.get("/users", authenticate, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Exclude password field
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Delete a user (Admin only)
router.delete("/users/:id", authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "✅ User deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Approve or Reject an auction (Admin only)
router.put("/auctions/:id", authenticate, isAdmin, async (req, res) => {
    try {
        const { status } = req.body; // "approved" or "rejected"
        const auction = await Auction.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!auction) return res.status(404).json({ message: "Auction not found" });

        res.json({ message: `✅ Auction ${status} successfully`, auction });
    } catch (error) {
        console.error("❌ Error updating auction:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get all auctions (Admin only)
router.get("/auctions", authenticate, isAdmin, async (req, res) => {
    try {
        const auctions = await Auction.find();
        res.json(auctions);
    } catch (error) {
        console.error("❌ Error fetching auctions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get all transactions (Admin only)
router.get("/transactions", authenticate, isAdmin, async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("buyer", "email")
            .populate("seller", "email")
            .populate("auction", "title");
        res.json(transactions);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

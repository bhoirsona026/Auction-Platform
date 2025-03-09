const express = require("express");
const multer = require("multer");
const { getUserProfile, updateUserProfile, changePassword } = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");
const Bid = require("../models/Bid");
const Auction = require("../models/Auction");
const User = require("../models/User");

const router = express.Router();

// ✅ Debugging logs to ensure controller functions are properly imported
console.log("✅ getUserProfile:", getUserProfile);
console.log("✅ updateUserProfile:", updateUserProfile);
console.log("✅ changePassword:", changePassword);


// ✅ User profile routes
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.put("/change-password", authenticate, changePassword);

// ✅ Get user's bidding history
router.get("/bids", authenticate, async (req, res) => {
    try {
        const bids = await Bid.find({ user: req.user._id }).populate("auction");
        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get auctions won by the user
router.get("/won-auctions", authenticate, async (req, res) => {
    try {
        const wonAuctions = await Auction.find({ highestBidder: req.user._id });
        res.json(wonAuctions);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ Upload profile picture
router.post("/upload-profile/:userId", upload.single("profilePicture"), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { profilePicture: req.file.path },
            { new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to upload profile picture" });
    }
});

module.exports = router;

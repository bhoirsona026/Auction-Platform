const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 }, // ✅ Track highest bid
    endTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },

    // ✅ Add bidding functionality
    bids: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who placed the bid
            amount: Number, // Bid amount
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Auction = mongoose.model("Auction", auctionSchema);
module.exports = Auction;

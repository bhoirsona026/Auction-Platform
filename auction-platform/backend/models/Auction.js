const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 }, // Highest bid
    endTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    category: { type: String, required: true }, // ✅ New field
    subcategory: { type: String }, // ✅ New field

    // Bidding history
    bids: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Bidder
            amount: { type: Number, required: true }, // Bid amount
            timestamp: { type: Date, default: Date.now } // Time of bid
        }
    ],

        // ✅ Proxy Bidding
        proxyBids: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                maxAmount: Number, // Maximum amount the user is willing to bid
                timestamp: { type: Date, default: Date.now }
            }
        ],

    // ✅ Winner & Status Tracking
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Auction winner
    highestBid: { type: Number, default: 0 }, // Highest bid amount
    status: { type: String, enum: ["active", "ended"], default: "active" }, // Auction status
    isClosed: { type: Boolean, default: false }, // ✅ Prevent bidding on closed auctions
});

// ✅ Automatically close auction & set winner
auctionSchema.methods.closeAuction = async function () {
    if (this.bids.length > 0) {
        const highestBid = this.bids.reduce((max, bid) => (bid.amount > max.amount ? bid : max), this.bids[0]);
        this.winner = highestBid.user;
        this.highestBid = highestBid.amount;
    }
    this.status = "ended";
    this.isClosed = true;
    await this.save();
};

auctionSchema.index({ title: "text", description: "text" });


const Auction = mongoose.model("Auction", auctionSchema);
module.exports = Auction;

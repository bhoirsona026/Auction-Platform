const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
}, { timestamps: true });

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
module.exports = Watchlist;

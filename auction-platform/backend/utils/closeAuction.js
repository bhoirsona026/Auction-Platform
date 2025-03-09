const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const User = require("../models/User");
const sendEmail = require("./sendEmail");

const closeAuction = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status === "ended") return;

    // Find the highest bid
    const highestBid = await Bid.findOne({ auction: auctionId })
      .sort({ amount: -1 })
      .populate("user");

    if (highestBid) {
      auction.winner = highestBid.user._id;
      auction.highestBid = highestBid.amount;
    }

    auction.status = "ended";
    await auction.save();

    if (auction.winner) {
      const winner = await User.findById(auction.winner);
      await sendEmail(
        winner.email,
        "🎉 You Won the Auction!",
        `Congratulations! You won the auction for "${auction.title}" with a bid of ${auction.highestBid}.`
      );
    }

    console.log(`Auction ${auctionId} closed successfully.`);
  } catch (error) {
    console.error("Error closing auction:", error);
  }
};

module.exports = closeAuction;

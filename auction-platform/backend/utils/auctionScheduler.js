const Auction = require("../models/Auction");

const checkAuctionExpiry = async () => {
    try {
        const now = new Date();
        const expiredAuctions = await Auction.find({ endTime: { $lte: now }, isClosed: false });

        for (const auction of expiredAuctions) {
            auction.isClosed = true;
            await auction.save();
            console.log(`Auction "${auction.title}" has been closed.`);
        }
    } catch (error) {
        console.error("Error checking auction expiry:", error);
    }
};

// Run this function every minute
setInterval(checkAuctionExpiry, 60 * 1000);

module.exports = checkAuctionExpiry;

const mongoose = require("mongoose");
const Auction = require("../models/Auction");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/emailService");
const io = require("../server"); // Ensure WebSockets are integrated

// ✅ Place a bid (Including Proxy Bidding)
const placeBid = async (req, res) => {
    try {
        const { auctionId, amount } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ message: "Invalid auction ID format" });
        }

        const auction = await Auction.findById(auctionId).populate("createdBy", "email username");

        if (!auction) return res.status(404).json({ message: "Auction not found" });

        // ✅ Ensure auction is still active
        if (new Date() > new Date(auction.endTime)) {
            return res.status(400).json({ message: "Auction has ended" });
        }

        // ✅ Ensure bid is higher than the current price
        if (amount <= auction.currentPrice) {
            return res.status(400).json({ message: "Bid must be higher than the current price" });
        }

        // ✅ Check if the user has an existing proxy bid
        let existingProxyBid = auction.proxyBids.find(pb => pb.user.toString() === userId.toString());

        if (existingProxyBid) {
            existingProxyBid.maxAmount = Math.max(existingProxyBid.maxAmount, amount);
        } else {
            auction.proxyBids.push({ user: userId, maxAmount: amount });
        }

        // ✅ Store the bid and update auction price
        auction.bids.push({ user: userId, amount });
        auction.currentPrice = amount;
        await auction.save();

        // ✅ Trigger auto-increment bid logic
        await autoIncrementBid(auction);

        // ✅ Notify Seller via WebSocket & Email
        await sendNotificationAndEmail(auction, amount, userId);

        // ✅ Broadcast bid update
        io.emit("bidUpdate", { auctionId, currentPrice: auction.currentPrice });

        res.status(200).json({ message: "Bid placed successfully", auction });
    } catch (error) {
        console.error("Error placing bid:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Auto-Increment Bids Based on Proxy Bidding
const autoIncrementBid = async (auction) => {
    try {
        let highestBidder = null;
        let highestBid = auction.currentPrice;
        let secondHighestBid = auction.startingPrice;

        // ✅ Find highest and second highest proxy bidders
        auction.proxyBids.forEach(pb => {
            if (pb.maxAmount > highestBid) {
                secondHighestBid = highestBid;
                highestBid = pb.maxAmount;
                highestBidder = pb.user;
            }
        });

        if (highestBidder) {
            auction.currentPrice = secondHighestBid + 1; // Increment by minimum bid step
            auction.bids.push({ user: highestBidder, amount: auction.currentPrice });
            await auction.save();

            // ✅ Notify the new highest bidder
            await sendNotificationAndEmail(auction, auction.currentPrice, highestBidder);
        }
    } catch (error) {
        console.error("Error in auto-increment bidding:", error);
    }
};

// ✅ Notify users via WebSocket & Email
const sendNotificationAndEmail = async (auction, amount, userId) => {
    try {
        const notification = new Notification({
            user: auction.createdBy._id,
            message: `New bid of $${amount} placed on ${auction.title}`,
        });
        await notification.save();
        io.emit(`notification-${auction.createdBy._id}`, notification);

        const emailText = `A new bid of $${amount} has been placed on your auction: ${auction.title}.
        Check your auction details: http://localhost:3000/auctions/${auction._id}`;
        await sendEmail(auction.createdBy.email, "New Bid Alert", emailText);
    } catch (error) {
        console.error("Error sending notification/email:", error);
    }
};

module.exports = { placeBid, autoIncrementBid };

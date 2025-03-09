const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ✅ Import Models
const Auction = require("./models/Auction");
const Notification = require("./models/Notification");
const Message = require("./models/Message");

// ✅ Create Express App & HTTP Server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Import Routes
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const auctionRoutes = require("./routes/auction")(io);
const notificationRoutes = require("./routes/notifications");
const watchlistRoutes = require("./routes/watchlist");
const analyticsRoutes = require("./routes/analytics");
const messageRoutes = require("./routes/messages");

// ✅ Use Routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/messages", messageRoutes);

// ✅ WebSocket Handling (Bidding & Notifications)
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // ✅ Handle Bid Placement
  socket.on("placeBid", async ({ auctionId, amount, userId }) => {
    try {
      const auction = await Auction.findById(auctionId);
      if (!auction) return;

      if (amount > auction.currentPrice) {
        auction.currentPrice = amount;
        auction.bids.push({ user: userId, amount });
        await auction.save();

        io.emit("bidUpdate", { auctionId, currentPrice: auction.currentPrice });

        // ✅ Send notification to auction creator
        const notification = new Notification({
          user: auction.createdBy,
          message: `New bid of $${amount} placed on your auction: ${auction.title}`,
        });
        await notification.save();
        io.emit(`notification-${auction.createdBy}`, notification);
      }
    } catch (error) {
      console.error("❌ Bid placement error:", error);
    }
  });

  // ✅ Handle Notifications
  socket.on("notify", async ({ userId, message }) => {
    const notification = new Notification({ user: userId, message });
    await notification.save();
    io.emit(`notification-${userId}`, notification);
  });

  // ✅ Handle Real-Time Messaging
  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      const newMessage = new Message({ senderId, receiverId, text: message });
      await newMessage.save();

      io.emit(`message-${receiverId}`, newMessage);
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Auction Expiry & Auto-Closure
const closeAuction = require("./utils/closeAuction");
const checkAuctionExpiry = require("./utils/auctionScheduler");

const checkAuctions = async () => {
  const now = new Date();
  const auctions = await Auction.find({ status: "active", endTime: { $lte: now } });

  for (const auction of auctions) {
    await closeAuction(auction._id);
  }
};

setInterval(checkAuctions, 60000); // Run every 60 seconds
checkAuctionExpiry(); // Start auction expiry job

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Admin Routes
app.use("/api/admin", adminRoutes);

module.exports = { io }; // Export `io` for controllers

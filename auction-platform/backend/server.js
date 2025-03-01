require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth"); // Ensure this path is correct

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors());

// Routes
app.use("/api/auth", authRoutes); // Check if this matches your Postman URL

// Server Connection
const PORT = 5000;
mongoose
  .connect("mongodb://127.0.0.1:27017/auctionDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

  const auctionRoutes = require("./routes/auction");

  app.use("/api/auctions", auctionRoutes);
  
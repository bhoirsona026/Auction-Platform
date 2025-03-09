import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to WebSocket server

const AuctionDetails = () => {
  const { id } = useParams(); // Get auction ID from URL
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ Fetch Auction Details when the component mounts
  useEffect(() => {
    if (!id) return; // Prevent fetching if ID is not available

    const fetchAuctionDetails = async () => {
      try {
        const response = await axios.get(`/api/auctions/${id}`);
        setAuction(response.data);
      } catch (error) {
        console.error("Error fetching auction details", error);
        setError("Failed to load auction details.");
      }
    };

    fetchAuctionDetails();
    const interval = setInterval(fetchAuctionDetails, 5000); // Auto-refresh every 5 sec

    return () => clearInterval(interval); // Cleanup on unmount
  }, [id]); // ✅ Fetch data when `id` changes

  // ✅ Listen for real-time bid updates
  useEffect(() => {
    socket.on("bidUpdate", ({ auctionId, currentPrice }) => {
      if (auctionId === id) {
        setAuction((prev) => ({ ...prev, currentPrice }));
      }
    });

    return () => {
      socket.off("bidUpdate"); // Cleanup socket listener
    };
  }, [id]);

  // ✅ Handle Bid Placement
  const placeBid = async () => {
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= auction.currentPrice) {
      alert("Bid must be a valid number and higher than the current price!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token"); // Ensure user is logged in
      const response = await axios.post(
        `/api/auctions/${id}/bid`,
        { amount: bidAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBidAmount(""); // Clear input after successful bid
      setLoading(false);
      setSuccessMessage("Bid placed successfully!");

      // ✅ Update auction state with new bid without full-page reload
      setAuction((prev) => ({
        ...prev,
        currentPrice: response.data.currentPrice,
        bids: [...prev.bids, response.data.newBid],
      }));

      socket.emit("placeBid", { auctionId: id, amount: bidAmount, userId: response.data.newBid.user });

      setTimeout(() => setSuccessMessage(""), 3000); // Hide success message after 3s
    } catch (error) {
      console.error("Error placing bid", error);
      setError("Failed to place bid. Please try again.");
      setLoading(false);
    }
  };

  // ✅ Navigate to Payment Page if user wins
  const handleProceedToPayment = () => {
    navigate("/payment", { state: { auction } });
  };

  if (!auction) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{auction.title}</h1>
      <p>{auction.description}</p>
      <p><strong>Starting Price:</strong> ${auction.startingPrice}</p>
      <p><strong>Current Price:</strong> ${auction.currentPrice}</p>
      <p><strong>Status:</strong> {auction.status}</p>
      <p><strong>End Time:</strong> {new Date(auction.endTime).toLocaleString()}</p>

      {/* ✅ Winner Info (if auction ended) */}
      {auction.status === "ended" && auction.winner && (
        <div>
          <p><strong>Winner:</strong> {auction.winner.name}</p>
          {auction.winner.id === localStorage.getItem("userId") && (
            <button onClick={handleProceedToPayment}>Proceed to Payment</button>
          )}
        </div>
      )}

      {/* ✅ Bidding Section (if auction is active) */}
      {auction.status === "active" && (
        <div>
          <h3>Place a Bid</h3>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount"
          />
          <button onClick={placeBid} disabled={loading}>
            {loading ? "Placing Bid..." : "Place Bid"}
          </button>
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}

      {/* ✅ Bid History */}
      <h3>Bid History</h3>
      <ul>
        {auction.bids.length > 0 ? (
          auction.bids.map((bid, index) => (
            <li key={index}>
              {bid.user.name}: ${bid.amount} at {new Date(bid.timestamp).toLocaleString()}
            </li>
          ))
        ) : (
          <p>No bids yet.</p>
        )}
      </ul>
    </div>
  );
};

export default AuctionDetails;

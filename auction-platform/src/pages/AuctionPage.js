import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket"; // WebSocket connection
import axios from "axios";

const AuctionPage = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auctions/${auctionId}`);
        setAuction(res.data);
      } catch (error) {
        console.error("Error fetching auction:", error);
      }
    };

    fetchAuction();

    socket.on("newBid", (bidData) => {
      if (bidData.auctionId === auctionId) {
        setAuction((prevAuction) => ({
          ...prevAuction,
          currentPrice: bidData.amount,
          bids: [...prevAuction.bids, { user: bidData.userId, amount: bidData.amount }],
        }));
      }
    });

    return () => {
      socket.off("newBid");
    };
  }, [auctionId]);

  const placeBid = async () => {
    if (!bidAmount || bidAmount <= auction.currentPrice) {
      alert("Bid must be higher than the current price!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/auctions/${auctionId}/bid`,
        { amount: bidAmount },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setBidAmount("");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      alert(error.response?.data?.message || "Error placing bid");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!auction) {
      alert("Auction details not available!");
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/payment/create-order", {
        amount: auction.currentPrice,
        currency: "INR",
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Use environment variable
        amount: auction.currentPrice * 100,
        currency: "INR",
        name: "Auction Platform",
        description: "Auction Payment",
        order_id: data.orderId,
        handler: function (response) {
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div>
      {auction ? (
        <>
          <h2>{auction.title}</h2>
          <p>{auction.description}</p>
          <h3>Current Price: ₹{auction.currentPrice}</h3>

          <input
            type="number"
            placeholder="Enter bid amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={loading}
          />
          <button onClick={placeBid} disabled={loading}>
            {loading ? "Placing Bid..." : "Place Bid"}
          </button>

          <button onClick={handlePayment} style={{ marginLeft: "10px" }}>
            Pay Now
          </button>

          <h3>Bid History:</h3>
          <ul>
            {auction.bids?.length > 0 ? (
              auction.bids.map((bid, index) => (
                <li key={index}>
                  User: {bid.user} | Amount: ₹{bid.amount}
                </li>
              ))
            ) : (
              <p>No bids yet.</p>
            )}
          </ul>
        </>
      ) : (
        <p>Loading auction...</p>
      )}
    </div>
  );
};

export default AuctionPage;

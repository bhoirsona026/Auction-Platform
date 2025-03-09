import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userResponse.data);
        setAuctions(userResponse.data.auctions);
        setBids(userResponse.data.bids);
      } catch (err) {
        console.error("Error fetching user profile", err);
        setError("Failed to load user profile.");
      }
    };

    fetchUserProfile();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>User Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      {/* User's Auctions */}
      <h2>Your Auctions</h2>
      {auctions.length > 0 ? (
        <ul>
          {auctions.map((auction) => (
            <li key={auction._id}>
              {auction.title} - {auction.status} - Current Price: ${auction.currentPrice}
            </li>
          ))}
        </ul>
      ) : (
        <p>No auctions created.</p>
      )}

      {/* User's Bids */}
      <h2>Your Bids</h2>
      {bids.length > 0 ? (
        <ul>
          {bids.map((bid, index) => (
            <li key={index}>
              Auction: {bid.auctionTitle} - Amount: ${bid.amount} - Status: {bid.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No bids placed.</p>
      )}
    </div>
  );
};

export default UserProfile;

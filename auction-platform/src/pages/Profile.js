import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch user profile
      const userRes = await axios.get("http://localhost:5000/api/users/profile", config);
      setUser(userRes.data);
      setProfilePicture(userRes.data.profilePicture);

      // Fetch bidding history
      const bidRes = await axios.get("http://localhost:5000/api/users/bids", config);
      setBiddingHistory(bidRes.data);

      // Fetch won auctions
      const wonRes = await axios.get("http://localhost:5000/api/users/won-auctions", config);
      setWonAuctions(wonRes.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // ✅ Handle Image Upload
  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append("profilePicture", e.target.files[0]);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(
        "http://localhost:5000/api/users/upload-profile",
        formData,
        config
      );

      setProfilePicture(response.data.profilePicture);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <h2>My Profile</h2>

      {user ? (
        <div>
          {/* ✅ Profile Picture Upload */}
          <img src={`http://localhost:5000/${profilePicture}`} alt="Profile" width="150" />
          <input type="file" onChange={handleImageUpload} />

          {/* ✅ User Information */}
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      {/* ✅ Bidding History */}
      <h3>Bidding History</h3>
      <ul>
        {biddingHistory.length > 0 ? (
          biddingHistory.map((bid) => (
            <li key={bid.auction._id}>
              {bid.auction.title} - Bid: ${bid.amount}
            </li>
          ))
        ) : (
          <p>No bidding history found.</p>
        )}
      </ul>

      {/* ✅ Won Auctions */}
      <h3>Won Auctions</h3>
      <ul>
        {wonAuctions.length > 0 ? (
          wonAuctions.map((auction) => (
            <li key={auction._id}>{auction.title} - Final Price: ${auction.currentPrice}</li>
          ))
        ) : (
          <p>No won auctions yet.</p>
        )}
      </ul>
    </div>
  );
};

export default Profile;

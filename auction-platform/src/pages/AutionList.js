import React, { useEffect, useState } from "react";

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/auctions/")
      .then((res) => res.json())
      .then((data) => setAuctions(data))
      .catch((err) => console.error("Error fetching auctions:", err));
  }, []);

  return (
    <div className="container">
      <h2>Live Auctions</h2>
      <div className="auction-list">
        {auctions.length === 0 ? (
          <p>No auctions available</p>
        ) : (
          auctions.map((auction) => (
            <div key={auction._id} className="auction-card">
              <h3>{auction.title}</h3>
              <p>{auction.description}</p>
              <p>Starting Bid: ${auction.startingBid}</p>
              <p>Created By: {auction.createdBy.username}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuctionList;

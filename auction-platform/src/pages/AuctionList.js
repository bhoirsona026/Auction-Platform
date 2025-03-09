import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Categories with Subcategories
  const categories = {
    Electronics: ["Mobile Phones", "Laptops", "Cameras"],
    Fashion: ["Clothing", "Shoes", "Accessories"],
    Art: ["Paintings", "Sculptures", "Photography"]
  };

  // ✅ Optimized API Call with Pagination
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:5000/api/auctions", {
        params: { search, category, subcategory, minPrice, maxPrice, status, page }
      });
      setAuctions(response.data.auctions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setError("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  }, [search, category, subcategory, minPrice, maxPrice, status, page]);

  // ✅ Debounced API Call
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchAuctions();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [fetchAuctions]);

  return (
    <div>
      <h2>Auction Listings</h2>

      {/* Search & Filter Inputs */}
      <div>
        <input
          type="text"
          placeholder="Search auctions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category Dropdown */}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {Object.keys(categories).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Subcategory Dropdown (Only if category is selected) */}
        {category && (
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
            <option value="">All Subcategories</option>
            {categories[category].map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>

        <button onClick={fetchAuctions}>Filter</button>
      </div>

      {/* Loading & Error Handling */}
      {loading && <p>Loading auctions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Auction Listings */}
      <ul>
        {auctions.length > 0 ? (
          auctions.map((auction) => (
            <li key={auction._id}>
              <Link to={`/auction/${auction._id}`}>{auction.title}</Link>
              <p>Starting Price: ${auction.startingPrice}</p>
              <p>Category: {auction.category}</p>
              <p>Subcategory: {auction.subcategory || "N/A"}</p>
              <p>Status: {auction.status}</p>
            </li>
          ))
        ) : (
          <p>No auctions found.</p>
        )}
      </ul>

      {/* Pagination Controls */}
      <div>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default AuctionList;

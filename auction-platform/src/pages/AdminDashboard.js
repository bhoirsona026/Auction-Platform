import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Button, Table, Form, Spinner, Badge } from "react-bootstrap";
import { CSVLink } from "react-csv";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [searchAuction, setSearchAuction] = useState("");
  const [userGrowth, setUserGrowth] = useState([]);
  const [topBids, setTopBids] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, auctionsRes, transactionsRes, userGrowthRes, topBidsRes] =
        await Promise.all([
          axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/auctions", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/transactions", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/analytics/users-growth", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/analytics/auctions/top-bids", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

      setUsers(usersRes.data);
      setAuctions(auctionsRes.data);
      setTransactions(transactionsRes.data);
      setUserGrowth(userGrowthRes.data);
      setTopBids(topBidsRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Auction Approval/Rejection
  const handleAuctionApproval = async (id, status) => {
    try {
      await axios.put(
        `/api/admin/auctions/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAuctions(auctions.map((auction) => (auction._id === id ? { ...auction, status } : auction)));
    } catch (error) {
      console.error("Error updating auction status", error);
    }
  };

  // ✅ Handle User Deletion
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <div className="container">
      <h2 className="my-4">Admin Dashboard</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {/* ✅ User Growth Chart */}
          <h3>User Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>

          {/* ✅ Auction Bids Chart */}
          <h3>Top 5 Most Bidded Auctions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topBids}>
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bidsCount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>

          {/* ✅ Export Buttons */}
          <div className="my-3">
            <CSVLink data={users} filename="users.csv" className="btn btn-primary mx-1">
              Export Users
            </CSVLink>
            <CSVLink data={auctions} filename="auctions.csv" className="btn btn-primary mx-1">
              Export Auctions
            </CSVLink>
          </div>

          {/* ✅ Users Table */}
          <h3>Users</h3>
          <Form.Control
            type="text"
            placeholder="Search users..."
            className="my-2"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((user) => user.name.toLowerCase().includes(searchUser.toLowerCase()))
                .map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={user.role === "admin" ? "danger" : "secondary"}>{user.role}</Badge>
                    </td>
                    <td>
                      {user.role !== "admin" && (
                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user._id)}>
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          {/* ✅ Auctions Table */}
          <h3>Auctions</h3>
          <Form.Control
            type="text"
            placeholder="Search auctions..."
            className="my-2"
            value={searchAuction}
            onChange={(e) => setSearchAuction(e.target.value)}
          />
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Starting Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions
                .filter((auction) => auction.title.toLowerCase().includes(searchAuction.toLowerCase()))
                .map((auction) => (
                  <tr key={auction._id}>
                    <td>{auction.title}</td>
                    <td>${auction.startingPrice}</td>
                    <td>
                      <Badge bg={auction.status === "approved" ? "success" : auction.status === "pending" ? "warning" : "danger"}>
                        {auction.status}
                      </Badge>
                    </td>
                    <td>
                      {auction.status === "pending" && (
                        <>
                          <Button variant="success" size="sm" onClick={() => handleAuctionApproval(auction._id, "approved")}>
                            Approve
                          </Button>
                          <Button variant="danger" size="sm" className="mx-1" onClick={() => handleAuctionApproval(auction._id, "rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

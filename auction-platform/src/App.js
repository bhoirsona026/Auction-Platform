import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuctionList from "./pages/AuctionList";
import AuctionPage from "./pages/AuctionPage";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import AuctionDetails from "./pages/AuctionDetails";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import "./App.css";

function App() {
  const [user, setUser] = useState(null); // ✅ Track logged-in user

  return (
    <Router>
      {/* ✅ Navbar is always visible */}
      <Navbar user={user} setUser={setUser} />

      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auction/:auctionId" element={<AuctionPage />} />
        <Route path="/auction/:id" element={<AuctionDetails />} />

        {/* ✅ Authentication Routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />

        {/* ✅ Protected User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute user={user}>
              <Messages user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:receiverId" 
          element={
            <ProtectedRoute user={user}>
              <Chat user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* ✅ Admin Dashboard (Only for Admins) */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute user={user} allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* ✅ Payment Routes */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;

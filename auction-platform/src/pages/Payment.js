import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auction = location.state?.auction || {};

  const handlePayment = () => {
    // Simulate payment success
    navigate("/payment-success");
  };

  return (
    <div>
      <h2>Complete Payment</h2>
      <p>Auction: {auction.title}</p>
      <p>Amount: ${auction.currentPrice}</p>

      <h3>Select Payment Method</h3>
      <div>
        <button onClick={handlePayment}>Pay with Stripe</button>
        <button onClick={handlePayment}>Pay with PayPal</button>
      </div>
    </div>
  );
};

export default Payment;

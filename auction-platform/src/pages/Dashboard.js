import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("You must be logged in to access the dashboard.");
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <p>You are now logged in.</p>
    </div>
  );
}

export default Dashboard;

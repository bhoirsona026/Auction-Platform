// controllers/adminController.js

// Sample Admin Dashboard Response
const getAdminDashboard = (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard!" });
};

// Export the function correctly
module.exports = { getAdminDashboard };

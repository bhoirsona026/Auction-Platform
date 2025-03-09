const User = require("../models/User");

// Middleware to check role-based access
const authorize = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Access Denied. You do not have permission." });
            }
            next();
        } catch (error) {
            console.error("Authorization Error:", error);
            res.status(500).json({ message: "Server Error" });
        }
    };
};

// Export only `authorize`
module.exports = authorize;

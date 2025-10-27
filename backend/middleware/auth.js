const jwt = require("jsonwebtoken");

// Middleware to verify JWT token and check role
const auth = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"

      if (!token) {
        return res.status(401).json({ message: "No token provided. Access denied." });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "library_secret_key_2025");

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access forbidden. Insufficient permissions." });
      }

      // Attach user info to request
      req.user = decoded; // { id, role }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};

module.exports = auth;
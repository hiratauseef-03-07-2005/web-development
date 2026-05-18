const jwt = require("jsonwebtoken");

// Verify JWT Token from Authorization header
// Used for protecting API routes
const verifyToken = (req, res, next) => {
  try {
    // Get Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please include Authorization header.",
      });
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Use: Authorization: Bearer <token>",
      });
    }

    const token = parts[1];

    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to req.user for use in route handlers
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // Continue to next middleware/route
    next();

  } catch (error) {
    // Token is invalid or expired
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token. Please login again.",
    });
  }
};

module.exports = { verifyToken };
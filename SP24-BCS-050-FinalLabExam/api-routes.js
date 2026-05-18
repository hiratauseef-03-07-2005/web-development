const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Product = require("./models/Product");
const { verifyToken } = require("./api-middleware");

const router = express.Router();

// ======================================
// 1. LOGIN ENDPOINT - Get JWT Token
// ======================================
// PUBLIC ENDPOINT - No authentication needed
// POST /api/v1/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user in database by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if password is correct (using comparePassword from User model)
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Password is correct - Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,      // User's MongoDB ID
        role: user.role,       // User's role (customer or admin)
      },
      process.env.JWT_SECRET,  // Secret key from .env
      {
        expiresIn: process.env.JWT_EXPIRES_IN, // Expiration time (e.g., "1h")
      }
    );

    // Send token and user info back to client
    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token,  // Client stores this token
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
});

// ======================================
// 2. GET ALL PRODUCTS - With Pagination & Filtering
// ======================================
// PUBLIC ENDPOINT - No token needed
// GET /api/v1/products?category=Cakes&page=1&limit=10
router.get("/products", async (req, res) => {
  try {
    // Get query parameters
    const { category, page = 1, limit = 10, search } = req.query;

    // Build filter object
    let filter = {};

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Search by product name if provided
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Query database
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Product.countDocuments(filter);

    // Send response
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.log("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products.",
      error: error.message,
    });
  }
});

// ======================================
// 3. GET SINGLE PRODUCT BY ID
// ======================================
// PUBLIC ENDPOINT - No token needed
// GET /api/v1/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      data: product,
    });

  } catch (error) {
    console.log("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product.",
      error: error.message,
    });
  }
});

// ======================================
// 4. GET USER PROFILE - PROTECTED
// ======================================
// PROTECTED ENDPOINT - Requires valid JWT token
// GET /api/v1/user/profile
// Header: Authorization: Bearer <token>
router.get("/user/profile", verifyToken, async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      data: user,
    });

  } catch (error) {
    console.log("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile.",
      error: error.message,
    });
  }
});

// ======================================
// 5. CREATE ORDER - PROTECTED
// ======================================
// PROTECTED ENDPOINT - Requires valid JWT token
// POST /api/v1/orders
// Header: Authorization: Bearer <token>
// Body: { items: [...], totalPrice: 5000 }
router.post("/orders", verifyToken, async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    // Validation: Check if items array exists and not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    // Check if totalPrice is provided
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total price must be greater than 0.",
      });
    }

    // Create order object
    // NOTE: In a real app, you would save this to an Order model in database
    const order = {
      userId: req.user.userId,        // From JWT token (via verifyToken middleware)
      items,                          // Array of products in order
      totalPrice,                     // Total price
      status: "pending",              // Initial status
      createdAt: new Date(),
    };

    // TODO: Uncomment when Order model is created
    // const savedOrder = await Order.create(order);

    // Send response with order details
    res.status(201).json({
      success: true,
      message: "Order created successfully!",
      data: {
        orderId: "ORD-" + Date.now(),  // Simple order ID
        ...order,
      },
    });

  } catch (error) {
    console.log("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order.",
      error: error.message,
    });
  }
});

module.exports = router;
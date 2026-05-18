require("dotenv").config(); 

const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const { isLoggedIn, isAdmin } = require("./middleware/auth-middleware");

const app = express();
const PORT = 3000;

// =====================
// MULTER SETUP (Image Upload)
// =====================
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// =====================
// CONNECT TO MONGODB
// =====================
mongoose
  .connect("mongodb://localhost:27017/sweetlayers")
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => console.log(" MongoDB connection error:", err));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files (css, js, images) from the public folder
app.use(express.static("public"));

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// =====================
// SESSION & FLASH SETUP
// =====================
app.use(session({
  secret: "your-secret-key-change-this",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: "mongodb://localhost:27017/sweetlayers",
    touchAfter: 24 * 3600 // 24 hours
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Flash messages
app.use(flash());

// Pass user data to all views
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.userName = req.session.userName;
  res.locals.userRole = req.session.userRole;
  res.locals.messages = req.flash();
  next();
});

// =====================
// ROUTES
// =====================

// Home Page
app.get("/", function (req, res) {
  res.render("index");
});

// Menu Page (static - your existing bakery menu)
app.get("/menu", function (req, res) {
  const menuItems = [
    {
      name: "Classic Strawberry Cake",
      description: "Strawberry sponge with fresh whipped cream and berry compote.",
      price: "Rs. 1,800",
      image: "/images/strawberry cake.png",
      alt: "Strawberry Cake",
    },
    {
      name: "Chocolate Fudge Cake",
      description: "Rich dark chocolate layers with silky fudge frosting.",
      price: "Rs. 2,200",
      image: "/images/choco cake.png",
      alt: "Chocolate Cake",
    },
    {
      name: "Cupcakes (Box of 12)",
      description: "Fluffy vanilla cupcakes topped with buttercream swirls.",
      price: "Rs. 1,200",
      image: "/images/cupcake.png",
      alt: "Cupcakes",
    },
    {
      name: "Red Velvet Cake",
      description: "Classic red velvet with cream cheese frosting.",
      price: "Rs. 2,500",
      image: "/images/redcake.png",
      alt: "Red Velvet Cake",
    },
    {
      name: "Choco Brownie",
      description: "Rich chocolate brownie with a gooey centre.",
      price: "Rs. 1,900",
      image: "/images/brownie.png",
      alt: "Choco Brownie",
    },
    {
      name: "Carrot Walnut Cake",
      description: "Moist carrot cake with walnuts and cream cheese frosting.",
      price: "Rs. 2,000",
      image: "/images/carrotcake.png",
      alt: "Carrot Walnut Cake",
    },
    {
      name: "Cheese Cake",
      description: "Creamy New York style cheesecake on a buttery biscuit base.",
      price: "Rs. 3,500",
      image: "/images/cheesecake.png",
      alt: "Cheese Cake",
    },
    {
      name: "Cookie",
      description: "Chewy chocolate chip cookies baked fresh daily.",
      price: "Rs. 800",
      image: "/images/cookie.png",
      alt: "Cookie",
    },
  ];
  res.render("menu", { menuItems: menuItems });
});

// About Page
app.get("/about", function (req, res) {
  res.render("about");
});

// Contact Page
app.get("/contact", function (req, res) {
  res.render("contact");
});

// =====================
// AUTHENTICATION ROUTES
// =====================

// SHOW REGISTER FORM
app.get("/register", (req, res) => {
  res.render("register");
});

// HANDLE REGISTRATION
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered. Try logging in.");
      return res.redirect("/register");
    }

    // Create new user (password auto-hashed by pre-save hook)
    const newUser = new User({ name, email, password });
    await newUser.save();

    req.flash("success", "Account created! Please log in.");
    res.redirect("/login");

  } catch (err) {
    console.log("Registration error:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/register");
  }
});

// SHOW LOGIN FORM
app.get("/login", (req, res) => {
  res.render("login");
});

// HANDLE LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password required");
      return res.redirect("/login");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    // Set session data
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    req.flash("success", `Welcome back, ${user.name}!`);
    
    // Redirect based on role
    if (user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/");
    }

  } catch (err) {
    console.log("Login error:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/login");
  }
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    // Cannot use req.flash() after session is destroyed — just redirect
    res.redirect("/");
  });
});


// =====================
// ADMIN SETUP ROUTE
// Creates the FIRST admin account -- only works when no admin exists yet.
// Visit: http://localhost:3000/admin-setup
// =====================
app.get("/admin-setup", async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.send(`
        <html><body style="font-family:Georgia,serif;max-width:420px;margin:60px auto;padding:20px;">
        <h2 style="color:#5c3317;">Admin already exists</h2>
        <p>Email: <strong>${existingAdmin.email}</strong></p>
        <p><a href="/login" style="color:#c0586a;">Login here</a></p>
        </body></html>
      `);
    }
    res.send(`
      <html><body style="font-family:Georgia,serif;max-width:420px;margin:60px auto;padding:20px;">
        <h2 style="color:#5c3317;">Create First Admin Account</h2>
        <p style="color:#666;margin-bottom:20px;">No admin exists yet. Use this form once to create one.</p>
        <form method="POST" action="/admin-setup" style="display:flex;flex-direction:column;gap:12px;">
          <input type="text" name="name" placeholder="Admin Name" required style="padding:10px;border:1px solid #ddd;border-radius:5px;font-size:1rem;" />
          <input type="email" name="email" placeholder="Admin Email" required style="padding:10px;border:1px solid #ddd;border-radius:5px;font-size:1rem;" />
          <input type="password" name="password" placeholder="Password (min 6 characters)" required style="padding:10px;border:1px solid #ddd;border-radius:5px;font-size:1rem;" />
          <button type="submit" style="background:#c0586a;color:#fff;padding:12px;border:none;border-radius:5px;font-size:1rem;cursor:pointer;font-weight:bold;">Create Admin Account</button>
        </form>
      </body></html>
    `);
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

app.post("/admin-setup", async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.send("Admin already exists. <a href=\"/login\">Login here</a>");
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.send("All fields required, password min 6 chars. <a href=\"/admin-setup\">Try again</a>");
    }
    const newAdmin = new User({ name, email, password, role: "admin" });
    await newAdmin.save();
    res.send(`
      <html><body style="font-family:Georgia,serif;max-width:420px;margin:60px auto;padding:20px;">
        <h2 style="color:#5c3317;">Admin Created Successfully!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> admin</p>
        <p style="margin-top:20px;"><a href="/login" style="background:#c0586a;color:#fff;padding:10px 24px;border-radius:5px;text-decoration:none;font-weight:bold;">Login Now</a></p>
      </body></html>
    `);
  } catch (err) {
    res.send("Error: " + err.message + " <a href=\"/admin-setup\">Try again</a>");
  }
});

// =====================
// PROMOTE EXISTING USER TO ADMIN
// Visit: /make-admin?email=user@example.com&secret=sweetlayers2025
// =====================
app.get("/make-admin", async (req, res) => {
  const { email, secret } = req.query;
  if (secret !== "sweetlayers2025") {
    return res.status(403).send("Invalid secret key.");
  }
  if (!email) {
    return res.send("Usage: /make-admin?email=user@example.com&secret=sweetlayers2025");
  }
  try {
    const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
    if (!user) return res.send("No user found with that email.");
    res.send(`User ${user.name} (${user.email}) is now an admin. <a href="/login">Login</a>`);
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

// USER PROFILE PAGE (Protected)
app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", {
    userName: req.session.userName,
  });
});

// =====================
// PRODUCTS ROUTE
// Dynamic catalog with pagination, filtering, searching
// =====================
app.get("/products", async function (req, res) {
  try {
    // --- PAGINATION ---
    const ITEMS_PER_PAGE = 8;
    const page = parseInt(req.query.page) || 1;

    // --- FILTERS from query params ---
    const search   = req.query.search   || "";
    const category = req.query.category || "";
    const minPrice = req.query.minPrice || "";
    const maxPrice = req.query.maxPrice || "";

    // --- BUILD MONGODB FILTER OBJECT ---
    const filter = {};

    // Search by name (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // --- QUERY DATABASE ---
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    const products = await Product.find(filter)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const categories = ["Cakes", "Cupcakes", "Brownies", "Cookies", "Cheesecakes", "Seasonal"];

    res.render("products", {
      products,
      categories,
      currentPage: page,
      totalPages,
      totalProducts,
      search,
      category,
      minPrice,
      maxPrice,
    });

  } catch (err) {
    console.log("Products route error:", err);
    res.status(500).send("Something went wrong. Make sure MongoDB is running.");
  }
});

// =====================
// ON-SALE PRODUCTS ROUTE
// GET /onsale-products
// Fetches ALL products where isOnSale is true in one go.
// No server-side pagination — the full array is injected into
// the EJS view and jQuery handles chunked display (10 per page).
// =====================
app.get("/onsale-products", async function (req, res) {
  try {
    // Query: only documents where isOnSale === true
    const onSaleProducts = await Product.find({ isOnSale: true });

    // Render the onsale.ejs view, injecting the full array
    res.render("onsale", {
      products: onSaleProducts,    // full array — no slicing here
    });

  } catch (err) {
    console.log("On-sale products route error:", err);
    res.status(500).send("Something went wrong. Make sure MongoDB is running.");
  }
});

// =====================
// ADMIN ROUTES
// =====================

// 1. ADMIN DASHBOARD - Show all products in a table
app.get("/admin", isLoggedIn, isAdmin, async function (req, res) {
  try {
    const products = await Product.find();
    res.render("admin-dashboard", { products });
  } catch (err) {
    console.log("Admin dashboard error:", err);
    res.status(500).send("Error loading admin dashboard");
  }
});

// 2. SHOW ADD PRODUCT FORM
app.get("/admin/add-product", isLoggedIn, isAdmin, function (req, res) {
  res.render("admin-add-product");
});

// 3. ADD NEW PRODUCT (CREATE)
app.post("/admin/add-product", isLoggedIn, isAdmin, upload.single("image"), async function (req, res) {
  try {
    const { name, price, category, rating, stock, description } = req.body;

    // Simple validation
    if (!name || !price || !category || !rating || !stock || !description || !req.file) {
      return res.status(400).send("All fields are required");
    }

    // Get image path
    const imagePath = "/uploads/" + req.file.filename;

    // Create new product
    const newProduct = new Product({
      name,
      price: parseInt(price),
      category,
      rating: parseFloat(rating),
      stock: parseInt(stock),
      description,
      image: imagePath,
    });

    await newProduct.save();
    res.redirect("/admin");

  } catch (err) {
    console.log("Add product error:", err);
    res.status(500).send("Error adding product");
  }
});

// 4. SHOW EDIT PRODUCT FORM
app.get("/admin/edit-product/:id", isLoggedIn, isAdmin, async function (req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("admin-edit-product", { product });
  } catch (err) {
    console.log("Edit form error:", err);
    res.status(500).send("Error loading edit form");
  }
});

// 5. UPDATE PRODUCT (UPDATE)
app.post("/admin/edit-product/:id", isLoggedIn, isAdmin, upload.single("image"), async function (req, res) {
  try {
    const { name, price, category, rating, stock, description } = req.body;

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Update fields
    product.name = name;
    product.price = parseInt(price);
    product.category = category;
    product.rating = parseFloat(rating);
    product.stock = parseInt(stock);
    product.description = description;

    // Update image only if new one uploaded
    if (req.file) {
      product.image = "/uploads/" + req.file.filename;
    }

    await product.save();
    res.redirect("/admin");

  } catch (err) {
    console.log("Update product error:", err);
    res.status(500).send("Error updating product");
  }
});

// 6. DELETE PRODUCT (DELETE)
app.post("/admin/delete-product/:id", isLoggedIn, isAdmin, async function (req, res) {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.log("Delete product error:", err);
    res.status(500).send("Error deleting product");
  }
});
// =====================
// API ROUTES (NEW)
// =====================
const apiRoutes = require("./api-routes");
app.use("/api/v1", apiRoutes);

// Start the server
app.listen(PORT, function () {
  console.log("Sweet Layers Bakery running at http://localhost:" + PORT);
});
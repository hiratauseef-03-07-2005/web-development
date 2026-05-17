const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
const PORT = 3000;

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

// Start the server
app.listen(PORT, function () {
  console.log("Sweet Layers Bakery running at http://localhost:" + PORT);
});

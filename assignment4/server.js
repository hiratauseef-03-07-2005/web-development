const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// =====================
// ADMIN ROUTES
// =====================

// 1. ADMIN DASHBOARD - Show all products in a table
app.get("/admin", async function (req, res) {
  try {
    const products = await Product.find();
    res.render("admin-dashboard", { products });
  } catch (err) {
    console.log("Admin dashboard error:", err);
    res.status(500).send("Error loading admin dashboard");
  }
});

// 2. SHOW ADD PRODUCT FORM
app.get("/admin/add-product", function (req, res) {
  res.render("admin-add-product");
});

// 3. ADD NEW PRODUCT (CREATE)
app.post("/admin/add-product", upload.single("image"), async function (req, res) {
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
app.get("/admin/edit-product/:id", async function (req, res) {
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
app.post("/admin/edit-product/:id", upload.single("image"), async function (req, res) {
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
app.post("/admin/delete-product/:id", async function (req, res) {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.log("Delete product error:", err);
    res.status(500).send("Error deleting product");
  }
});

// Start the server
app.listen(PORT, function () {
  console.log("Sweet Layers Bakery running at http://localhost:" + PORT);
});

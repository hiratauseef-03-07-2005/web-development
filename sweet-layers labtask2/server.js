const express = require("express");
const app = express();
const PORT = 3000;

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

// Menu Page
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
      description: "Fully customised cake for your special day. Any flavour, any design.",
      price: "From Rs. 3,500",
      image: "/images/cheesecake.png",
      alt: "Cheese Cake",
    },
    {
      name: "Cookie",
      description: "Fully customised cookie for your special day. Any flavour, any design.",
      price: "From Rs. 3,500",
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

// Start the server
app.listen(PORT, function () {
  console.log("Sweet Layers Bakery server running at http://localhost:" + PORT);
});

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Cakes", "Cupcakes", "Brownies", "Cookies", "Cheesecakes", "Seasonal"],
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  stock: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  // ── NEW FIELDS for On-Sale feature ──────────────────────────
  isOnSale: {
    type: Boolean,
    default: false,       // false by default; set true for sale products
  },
  salePrice: {
    type: Number,
    default: null,        // the discounted price shown on the sale page
  },
});

module.exports = mongoose.model("Product", productSchema);
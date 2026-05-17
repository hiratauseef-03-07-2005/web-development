const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://localhost:27017/sweetlayers")
  .then(() => console.log("Connected to MongoDB for seeding..."))
  .catch((err) => console.log("Connection error:", err));

const products = [
  // CAKES
  {
    name: "Classic Strawberry Cake",
    price: 1800,
    category: "Cakes",
    rating: 4.8,
    stock: 10,
    description: "Strawberry sponge with fresh whipped cream and berry compote.",
    image: "/images/strawberry cake.png",
  },
  {
    name: "Chocolate Fudge Cake",
    price: 2200,
    category: "Cakes",
    rating: 4.9,
    stock: 8,
    description: "Rich dark chocolate layers with silky fudge frosting.",
    image: "/images/choco cake.png",
  },
  {
    name: "Red Velvet Cake",
    price: 2500,
    category: "Cakes",
    rating: 4.7,
    stock: 6,
    description: "Classic red velvet with cream cheese frosting.",
    image: "/images/redcake.png",
  },
  {
    name: "Carrot Walnut Cake",
    price: 2000,
    category: "Cakes",
    rating: 4.5,
    stock: 7,
    description: "Moist carrot cake with walnuts and cream cheese frosting.",
    image: "/images/carrotcake.png",
  },
  {
    name: "Lemon Drizzle Cake",
    price: 1900,
    category: "Cakes",
    rating: 4.6,
    stock: 9,
    description: "Light sponge with zesty lemon glaze and candied peel.",
    image: "/images/strawberry cake.png",
  },
  {
    name: "Black Forest Cake",
    price: 2800,
    category: "Cakes",
    rating: 4.9,
    stock: 5,
    description: "Layers of chocolate sponge, cherries and whipped cream.",
    image: "/images/choco cake.png",
  },
  {
    name: "Vanilla Butter Cake",
    price: 1600,
    category: "Cakes",
    rating: 4.3,
    stock: 12,
    description: "Classic vanilla sponge with silky butter cream frosting.",
    image: "/images/strawberry cake.png",
  },
  {
    name: "Mango Cream Cake",
    price: 2100,
    category: "Cakes",
    rating: 4.7,
    stock: 6,
    description: "Fresh mango layers with light whipped cream filling.",
    image: "/images/strawberry cake.png",
  },
  // CUPCAKES
  {
    name: "Cupcakes Box of 12",
    price: 1200,
    category: "Cupcakes",
    rating: 4.8,
    stock: 20,
    description: "Fluffy vanilla cupcakes topped with buttercream swirls.",
    image: "/images/cupcake.png",
  },
  {
    name: "Chocolate Cupcakes Box of 12",
    price: 1400,
    category: "Cupcakes",
    rating: 4.7,
    stock: 15,
    description: "Rich chocolate cupcakes with dark ganache topping.",
    image: "/images/cupcake.png",
  },
  {
    name: "Red Velvet Cupcakes Box of 6",
    price: 900,
    category: "Cupcakes",
    rating: 4.6,
    stock: 18,
    description: "Mini red velvet cupcakes with cream cheese swirls.",
    image: "/images/cupcake.png",
  },
  {
    name: "Strawberry Cupcakes Box of 6",
    price: 850,
    category: "Cupcakes",
    rating: 4.4,
    stock: 14,
    description: "Fresh strawberry cupcakes with pink buttercream.",
    image: "/images/cupcake.png",
  },
  // BROWNIES
  {
    name: "Choco Brownie",
    price: 1900,
    category: "Brownies",
    rating: 4.9,
    stock: 15,
    description: "Rich chocolate brownie with a gooey fudge centre.",
    image: "/images/brownie.png",
  },
  {
    name: "Walnut Brownie",
    price: 2000,
    category: "Brownies",
    rating: 4.7,
    stock: 12,
    description: "Classic brownie loaded with crunchy walnuts throughout.",
    image: "/images/brownie.png",
  },
  {
    name: "Nutella Brownie",
    price: 2200,
    category: "Brownies",
    rating: 4.8,
    stock: 10,
    description: "Double chocolate brownie with a Nutella swirl core.",
    image: "/images/brownie.png",
  },
  {
    name: "Caramel Brownie",
    price: 2100,
    category: "Brownies",
    rating: 4.6,
    stock: 8,
    description: "Fudgy brownie with a salted caramel drizzle on top.",
    image: "/images/brownie.png",
  },
  // COOKIES
  {
    name: "Choco Chip Cookies Box of 12",
    price: 800,
    category: "Cookies",
    rating: 4.8,
    stock: 25,
    description: "Classic chewy cookies loaded with dark chocolate chips.",
    image: "/images/cookie.png",
  },
  {
    name: "Oatmeal Raisin Cookies Box of 12",
    price: 750,
    category: "Cookies",
    rating: 4.3,
    stock: 20,
    description: "Hearty oatmeal cookies with plump raisins and cinnamon.",
    image: "/images/cookie.png",
  },
  {
    name: "Peanut Butter Cookies Box of 12",
    price: 850,
    category: "Cookies",
    rating: 4.6,
    stock: 18,
    description: "Soft and crumbly peanut butter cookies with a fork press.",
    image: "/images/cookie.png",
  },
  {
    name: "Double Choco Cookies Box of 6",
    price: 600,
    category: "Cookies",
    rating: 4.9,
    stock: 22,
    description: "Intensely chocolatey cookies with white chocolate chunks.",
    image: "/images/cookie.png",
  },
  // CHEESECAKES
  {
    name: "Classic New York Cheesecake",
    price: 3500,
    category: "Cheesecakes",
    rating: 4.9,
    stock: 5,
    description: "Dense and creamy New York style cheesecake on a buttery base.",
    image: "/images/cheesecake.png",
  },
  {
    name: "Strawberry Cheesecake",
    price: 3800,
    category: "Cheesecakes",
    rating: 4.8,
    stock: 4,
    description: "Creamy cheesecake topped with fresh strawberry coulis.",
    image: "/images/cheesecake.png",
  },
  {
    name: "Blueberry Cheesecake",
    price: 3900,
    category: "Cheesecakes",
    rating: 4.7,
    stock: 4,
    description: "Velvety cheesecake with a tangy blueberry compote topping.",
    image: "/images/cheesecake.png",
  },
  // SEASONAL
  {
    name: "Eid Special Cake",
    price: 4500,
    category: "Seasonal",
    rating: 5.0,
    stock: 3,
    description: "Custom decorated Eid celebration cake with gold detailing.",
    image: "/images/strawberry cake.png",
  },
  {
    name: "Christmas Fruit Cake",
    price: 3200,
    category: "Seasonal",
    rating: 4.5,
    stock: 6,
    description: "Traditional fruit cake soaked with festive spices and dried fruit.",
    image: "/images/carrotcake.png",
  },
];

// Clear existing products and insert fresh ones
Product.deleteMany({})
  .then(() => {
    return Product.insertMany(products);
  })
  .then(() => {
    console.log("✅ 25 products seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log("❌ Seeding error:", err);
    mongoose.connection.close();
  });

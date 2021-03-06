const express = require("express");

const userRouter = require("./routes/userRoutes");
const addressRouter = require("./routes/addressRoutes");
const productRouter = require("./routes/productRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const cartRouter = require("./routes/cartRoutes");
const otherRouter = require("./routes/otherRoutes");

// Start express app
const app = express();

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.get("/", (req, res) => {
  res.send("<h1>HELLO WORLD!</h1>");
});

// --------------USER ROUTES
app.use("/api/v1/user", userRouter);
// --------------ADDRESS ROUTES
app.use("/api/v1/address", addressRouter);
// --------------PRODUCT ROUTES
app.use("/api/v1/product", productRouter);
// --------------WISHLIST ROUTES
app.use("/api/v1/wishlist", wishlistRouter);
// --------------CART ROUTES
app.use("/api/v1/cart", cartRouter);
// --------------OTHER ROUTES
app.use("/api/v1", otherRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;

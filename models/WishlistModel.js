const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    shopper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shopper",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;

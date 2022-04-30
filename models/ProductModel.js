const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    productTitle: {
      type: String,
      required: [true, "Product must have a title"],
    },
    productDescription: {
      type: String,
    },
    productPoints: [
      {
        type: String,
      },
    ],
    images: [String],
    price: {
      type: Number,
      required: [true, "A Product must have a price"],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;

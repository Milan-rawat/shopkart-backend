const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order: {
      orderId: String,
      totalPrice: Number,
      address: {
        type: Object,
      },
      status: {
        type: String,
        enum: ["PENDING", "ONGOING", "DISPATCHED", "DELIVERED", "CANCELLED"],
        default: "PENDING",
      },
      orderedAt: {
        type: Date,
        default: Date.now(),
      },
      item: {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    },
    shopper: {
      type: mongoose.Schema.ObjectId,
      ref: "Shopper",
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: "Seller",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate("order.item.product");
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

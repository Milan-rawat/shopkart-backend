const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");
const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");

const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

exports.addToCart = [
  validateBody(["productId"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const { productId, quantity } = req.body;

      const product = await Product.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({
          status: false,
          message: "Product not Found!",
        });
      }
      const cart = await Cart.findOne({ shopper: req.user._id });
      if (cart) {
        let cartArr = cart.items;
        let index;
        let found = cartArr.find((item, pos) => {
          if (item.product.toString() === productId.toString()) {
            index = pos;
            return item;
          }
        });
        if (found) {
          cartArr[index].quantity =
            parseInt(cartArr[index].quantity) + (parseInt(quantity) || 1);
          cart.items = cartArr;
          cart.save();
          return res.status(200).json({
            status: true,
            message: "Added to Cart",
            cart: cart.items,
          });
        }
        cartArr.unshift({ product: productId, quantity: quantity || 1 });
        cart.items = cartArr;
        cart.save();
        return res.status(200).json({
          status: true,
          message: "Added to Cart",
          cart: cart.items,
        });
      }

      const newCart = await Cart.create({
        shopper: req.user._id,
        items: [{ product: productId, quantity: quantity || 1 }],
      });

      res.status(200).json({
        status: true,
        message: "Added to Cart",
        cart: newCart.items,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.removeFromCart = [
  validateBody(["productId"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const { productId } = req.body;

      const product = await Product.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({
          status: false,
          message: "Product not Found!",
        });
      }
      const cart = await Cart.findOne({ shopper: req.user._id });
      if (!cart) {
        return res.status(200).json({
          status: true,
          message: "This product is not present in the cart!",
        });
      }

      // IF NOT IN CART, CAN'T ADD IN CART ELSE ADD
      if (
        cart.items !== null &&
        cart.items !== undefined &&
        cart.items.length > 0
      ) {
        let present = false;
        cart.items.forEach((prd) => {
          if (prd.product.toString() === productId.toString()) {
            present = true;
          }
        });
        if (present) {
          var filtered = cart.items.filter(function (prd) {
            return prd.product.toString() !== productId.toString();
          });
          cart.items = filtered;

          await cart.save();
          return res.status(200).json({
            status: true,
            message: "Removed from cart",
          });
        }
        if (!present) {
          return res.status(403).json({
            status: false,
            message: "This product is not present in the cart!",
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          message: "This product is not present in the cart!",
        });
      }
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.changeQuantity = [
  validateBody(["productId", "quantity"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const { productId } = req.body;

      const product = await Product.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({
          status: false,
          message: "Product not Found!",
        });
      }
      const cart = await Cart.findOne({ shopper: req.user._id });
      if (!cart) {
        return res.status(200).json({
          status: true,
          message: "This product is not present in the cart!",
        });
      }

      // IF NOT IN CART, CAN'T ADD IN CART ELSE ADD
      if (
        cart.items !== null &&
        cart.items !== undefined &&
        cart.items.length > 0
      ) {
        let present = false;
        let index;
        cart.items.forEach((prd, pos) => {
          if (prd.product.toString() === productId.toString()) {
            present = true;
            index = pos;
          }
        });
        if (present) {
          cart.items[index].quantity = req.body.quantity;
          await cart.save();
          return res.status(200).json({
            status: true,
            message: "Quantity changed!",
            cart: cart,
          });
        }
        if (!present) {
          return res.status(403).json({
            status: false,
            message: "This product is not present in the cart!",
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          message: "This product is not present in the cart!",
        });
      }
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.getMyCart = async (req, res) => {
  try {
    const cart = (await Cart.findOne({ shopper: req.user._id }).populate([
      { path: "items.product" },
      { path: "items.product" },
    ])) || { items: [] };

    res.status(200).json({
      status: true,
      cart: cart.items,
    });
  } catch (err) {
    throwErrorMessage(err, res);
  }
};

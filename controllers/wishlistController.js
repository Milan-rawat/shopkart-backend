const Product = require("../models/ProductModel");
const Wishlist = require("../models/WishlistModel");

const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

exports.addToWishlist = [
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
      const wishlist = await Wishlist.findOne({ shopper: req.user._id });
      if (wishlist) {
        let wishlistArr = wishlist.products;
        let found = wishlistArr.find(
          (item) => item.toString() === productId.toString()
        );
        if (!found) {
          wishlistArr.unshift(productId);
          wishlist.products = wishlistArr;
          wishlist.save();
          return res.status(200).json({
            status: true,
            message: "Added successfully",
            wishlist: wishlist.products,
          });
        }
        return res.status(209).json({
          status: false,
          message: "Item already in wishlist",
        });
      }

      const newWishlist = await Wishlist.create({
        shopper: req.user._id,
        products: [productId],
      });

      res.status(200).json({
        status: true,
        message: "Added successfully",
        wishlist: newWishlist.products,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.removeFromWishlist = [
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
      const wishlist = await Wishlist.findOne({ shopper: req.user._id });
      if (!wishlist) {
        return res.status(200).json({
          status: true,
          message: "This product is not present in the Wishlist!",
        });
      }

      // IF NOT IN WISHLIST, CAN'T ADD IN WISHLIST ELSE ADD
      if (
        wishlist.products !== null &&
        wishlist.products !== undefined &&
        wishlist.products.length > 0
      ) {
        let present = false;
        wishlist.products.forEach((prd) => {
          if (prd.toString() === productId.toString()) {
            present = true;
          }
        });
        if (present) {
          var filtered = wishlist.products.filter(function (prd) {
            return prd.toString() !== productId.toString();
          });
          wishlist.products = filtered;

          await wishlist.save();
          return res.status(200).json({
            status: true,
            message: "Removed from Wishlist",
          });
        }
        if (!present) {
          return res.status(403).json({
            status: false,
            message: "This product is not present in the Wishlist!",
          });
        }
      } else {
        return res.status(403).json({
          status: false,
          message: "This product is not present in the Wishlist!",
        });
      }
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.getMyWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ shopper: req.user._id }).populate(
      "products"
    );
    if (!wishlist) {
      return res.status(200).json({
        status: true,
        wishlist: [],
      });
    }

    res.status(200).json({
      status: true,
      wishlist: wishlist.products,
    });
  } catch (err) {
    throwErrorMessage(err, res);
  }
};

const jwt = require("jsonwebtoken");
const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");

exports.getUser = async (token, next) => {
  token = token.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, jwtuser) => {
    if (err) {
      next("INVALID_TOKEN");
    } else {
      const user =
        (await Shopper.findOne({ _id: jwtuser.userId })) ||
        (await Seller.findOne({ _id: jwtuser.userId }));
      if (user) {
        next(user);
      } else {
        next("INVALID_TOKEN");
      }
    }
  });
};

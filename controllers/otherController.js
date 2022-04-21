const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");

const { throwErrorMessage } = require("../utils/errorHelper");

exports.getMe = async (req, res) => {
  try {
    let user =
      (await Shopper.findById(req.user._id)) ||
      (await Seller.findById(req.user._id));

    res.status(200).json({
      status: true,
      me: user,
    });
  } catch (err) {
    throwErrorMessage(err, res);
  }
};

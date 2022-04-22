const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");

const { throwErrorMessage } = require("../utils/errorHelper");

exports.getMe = async (req, res) => {
  try {
    let Model = Shopper;
    if (req.user.userType === "SELLER") Model = Seller;
    let user = await Model.findById(req.user._id).populate("address");

    res.status(200).json({
      status: true,
      me: user,
    });
  } catch (err) {
    throwErrorMessage(err, res);
  }
};

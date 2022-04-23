const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");

const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

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

exports.updateMe = async (req, res) => {
  try {
    const { fullName, profilePicture } = req.body;
    let defaultPic =
      "https://t4.ftcdn.net/jpg/03/46/93/61/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg";
    req.user.fullName = fullName;
    req.user.profilePicture = profilePicture ? profilePicture : defaultPic;
    req.user.save();

    res.status(200).json({
      status: true,
      me: req.user,
    });
  } catch (err) {
    throwErrorMessage(err, res);
  }
};

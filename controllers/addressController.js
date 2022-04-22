const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");
const Address = require("../models/AddressModel");

const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

exports.getMyAddresses = [
  async (req, res) => {
    try {
      let Model = Shopper;
      if (req.user.userType === "SELLER") Model = Seller;
      const user = await Model.findOne({ _id: req.user._id }).populate(
        "address"
      );
      res.status(201).json({
        status: true,
        addresses: user.address,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.addAddress = [
  validateBody([
    "userName",
    "phoneNumber",
    "addressLine1",
    "landmark",
    "city",
    "state",
    "zipCode",
    "country",
  ]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const userAddress = await Address.create({
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        landmark: req.body.landmark,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
      });
      let allAddresses = req.user.address;
      allAddresses.unshift(userAddress);
      req.user.address = allAddresses;
      req.user.save();

      res.status(201).json({
        status: true,
        mesage: "Address Added!",
        address: userAddress,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.updateAddress = [
  validateBody([
    "addressId",
    "userName",
    "phoneNumber",
    "addressLine1",
    "landmark",
    "city",
    "state",
    "zipCode",
    "country",
  ]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      let found = req.user.address.find(
        (address) => address.toString() === req.body.addressId.toString()
      );

      if (!found) {
        return res.status(404).json({
          status: false,
          message: "Address Not Found!",
        });
      }
      const newAddress = {
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        landmark: req.body.landmark,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
      };
      const updateAddress = await Address.findOneAndUpdate(
        { _id: req.body.addressId },
        newAddress,
        { new: true }
      );

      res.status(201).json({
        status: true,
        mesage: "Address Updated!",
        address: updateAddress,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.removeAddress = [
  validateBody(["addressId"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      let found = req.user.address.find(
        (address) => address.toString() === req.body.addressId.toString()
      );

      if (!found) {
        return res.status(404).json({
          status: false,
          message: "Address Not Found!",
        });
      }
      var filteredAddresses = req.user.address.filter(
        (id) => id.toString() !== req.body.addressId
      );

      req.user.address = filteredAddresses;
      req.user.save();

      await Address.findOneAndDelete({ _id: req.body.addressId });

      res.status(201).json({
        status: true,
        mesage: "Address Removed!",
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

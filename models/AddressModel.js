const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "Provide you phone number"],
    },
    addressLine1: {
      type: String,
      required: [true, "Provide your address"],
    },
    addressLine2: {
      type: String,
    },
    landmark: {
      type: String,
      required: [true, "Landmark is required"],
    },
    city: {
      type: String,
      required: [true, "Provide your city"],
    },
    state: {
      type: String,
      required: [true, "Provide your State"],
    },
    zipCode: {
      type: String,
      required: [true, "Provide your Zipcode"],
    },
    country: {
      type: String,
      required: [true, "Provide your Country"],
    },
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;

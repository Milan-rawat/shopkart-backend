const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const shopperSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      select: false,
      minlength: [8, "Minimum password length is 8 characters"],
    },
    userType: {
      type: String,
      enum: ["SELLER", "SHOPPER"],
      default: "SHOPPER",
    },
    profilePicture: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/03/46/93/61/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    confirmationCode: String,
    confirmationCodeExpires: Date,
  },

  {
    timestamps: true,
  }
);

shopperSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

shopperSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

shopperSchema.methods.createVerificationCode = function () {
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  this.confirmationCode = crypto
    .createHash("sha256")
    .update(verificationCode.toString())
    .digest("hex");

  this.confirmationCodeExpires = Date.now() + 10 * 60 * 1000;

  return verificationCode;
};

const Shopper = mongoose.model("Shopper", shopperSchema);

module.exports = Shopper;
